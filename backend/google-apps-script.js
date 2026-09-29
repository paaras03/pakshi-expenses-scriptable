/**
 * Pakshi Expenses — Scriptable Google Sheets backend
 * Prototype backend only. Not production authentication.
 *
 * Sheets:
 * Members, Categories, Expenses, Income, Savings, Budgets
 *
 * Deploy as Web App:
 * Execute as: Me
 * Who has access: Anyone
 *
 * Set Script Property:
 * PAKSHI_API_TOKEN = a long random value shared with the two Scriptable clients.
 */

const SHEETS = {
  members: ["Members", ["id", "name", "role"]],
  categories: ["Categories", ["id", "name", "iconKey", "sortOrder", "isDefault"]],
  expenses: ["Expenses", ["id", "date", "amount", "categoryId", "description", "paymentMethod", "paidBy", "notes", "createdAt", "updatedAt", "deleted"]],
  income: ["Income", ["month", "firstMemberAmount", "secondMemberAmount", "updatedAt"]],
  savings: ["Savings", ["ownerType", "amount", "asOfDate", "updatedAt"]],
  budgets: ["Budgets", ["id", "month", "categoryId", "amount", "updatedAt"]]
};

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

function tokenValid_(token) {
  const expected = PropertiesService.getScriptProperties().getProperty("PAKSHI_API_TOKEN");
  return !!expected && token === expected;
}

function fail_(message, code) {
  return json_({ ok: false, error: message, code: code || "ERROR" });
}

function sheet_(key) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const config = SHEETS[key];
  if (!config) throw new Error("Unknown sheet: " + key);

  let sh = ss.getSheetByName(config[0]);
  if (!sh) {
    sh = ss.insertSheet(config[0]);
    sh.getRange(1, 1, 1, config[1].length).setValues([config[1]]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function rows_(key) {
  const sh = sheet_(key);
  const values = sh.getDataRange().getValues();
  if (values.length <= 1) return [];

  const headers = values[0];
  return values.slice(1).filter(row => row.some(v => v !== "")).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function append_(key, obj) {
  const sh = sheet_(key);
  const headers = SHEETS[key][1];
  sh.appendRow(headers.map(h => obj[h] === undefined ? "" : obj[h]));
}

function updateById_(key, id, obj) {
  const sh = sheet_(key);
  const values = sh.getDataRange().getValues();
  const headers = values[0];
  const idIndex = headers.indexOf("id");

  if (idIndex < 0) throw new Error("No id column");

  for (let r = 1; r < values.length; r++) {
    if (String(values[r][idIndex]) === String(id)) {
      headers.forEach((h, c) => {
        if (obj[h] !== undefined) sh.getRange(r + 1, c + 1).setValue(obj[h]);
      });
      return true;
    }
  }
  return false;
}

function body_(e) {
  try {
    return JSON.parse(e.postData.contents || "{}");
  } catch (_) {
    return {};
  }
}

function doGet(e) {
  const p = e.parameter || {};
  if (!tokenValid_(p.token)) return fail_("Unauthorized", "UNAUTHORIZED");

  try {
    const action = p.action || "bootstrap";

    if (action === "bootstrap") {
      return json_({
        ok: true,
        members: rows_("members"),
        categories: rows_("categories"),
        expenses: rows_("expenses").filter(x => String(x.deleted) !== "true"),
        income: rows_("income"),
        savings: rows_("savings"),
        budgets: rows_("budgets")
      });
    }

    return fail_("Unknown action", "UNKNOWN_ACTION");
  } catch (err) {
    return fail_(String(err), "SERVER_ERROR");
  }
}

function doPost(e) {
  const body = body_(e);
  if (!tokenValid_(body.token)) return fail_("Unauthorized", "UNAUTHORIZED");

  try {
    const action = body.action;

    if (action === "saveExpense") {
      const x = body.expense;
      if (!x || !x.id || Number(x.amount) <= 0 || !x.date || !x.categoryId || !x.description || !x.paidBy) {
        return fail_("Invalid expense", "VALIDATION");
      }

      append_("expenses", {
        id: x.id,
        date: x.date,
        amount: Number(x.amount),
        categoryId: x.categoryId,
        description: x.description,
        paymentMethod: x.paymentMethod || "card",
        paidBy: x.paidBy,
        notes: x.notes || "",
        createdAt: x.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: false
      });

      return json_({ ok: true });
    }

    if (action === "updateExpense") {
      const x = body.expense;
      const found = updateById_("expenses", x.id, {
        date: x.date,
        amount: Number(x.amount),
        categoryId: x.categoryId,
        description: x.description,
        paymentMethod: x.paymentMethod,
        paidBy: x.paidBy,
        notes: x.notes || "",
        updatedAt: new Date().toISOString()
      });

      return found ? json_({ ok: true }) : fail_("Expense not found", "NOT_FOUND");
    }

    if (action === "deleteExpense") {
      const found = updateById_("expenses", body.id, {
        deleted: true,
        updatedAt: new Date().toISOString()
      });

      return found ? json_({ ok: true }) : fail_("Expense not found", "NOT_FOUND");
    }

    if (action === "saveIncome") {
      const x = body.income;
      const existing = rows_("income").find(r => String(r.month) === String(x.month));
      if (existing) {
        const sh = sheet_("income");
        const values = sh.getDataRange().getValues();
        const headers = values[0];
        const monthIndex = headers.indexOf("month");
        for (let r = 1; r < values.length; r++) {
          if (String(values[r][monthIndex]) === String(x.month)) {
            sh.getRange(r + 1, headers.indexOf("firstMemberAmount") + 1).setValue(Number(x.firstMemberAmount || 0));
            sh.getRange(r + 1, headers.indexOf("secondMemberAmount") + 1).setValue(Number(x.secondMemberAmount || 0));
            sh.getRange(r + 1, headers.indexOf("updatedAt") + 1).setValue(new Date().toISOString());
            return json_({ ok: true });
          }
        }
      }

      append_("income", {
        month: x.month,
        firstMemberAmount: Number(x.firstMemberAmount || 0),
        secondMemberAmount: Number(x.secondMemberAmount || 0),
        updatedAt: new Date().toISOString()
      });

      return json_({ ok: true });
    }

    if (action === "saveSavings") {
      const x = body.savings;
      const sh = sheet_("savings");
      const values = sh.getDataRange().getValues();
      const headers = values[0];
      const ownerIndex = headers.indexOf("ownerType");

      for (let r = 1; r < values.length; r++) {
        if (String(values[r][ownerIndex]) === String(x.ownerType)) {
          sh.getRange(r + 1, headers.indexOf("amount") + 1).setValue(Number(x.amount || 0));
          sh.getRange(r + 1, headers.indexOf("asOfDate") + 1).setValue(x.asOfDate);
          sh.getRange(r + 1, headers.indexOf("updatedAt") + 1).setValue(new Date().toISOString());
          return json_({ ok: true });
        }
      }

      append_("savings", {
        ownerType: x.ownerType,
        amount: Number(x.amount || 0),
        asOfDate: x.asOfDate,
        updatedAt: new Date().toISOString()
      });

      return json_({ ok: true });
    }

    if (action === "saveBudget") {
      const x = body.budget;
      const existing = rows_("budgets").find(r =>
        String(r.month) === String(x.month) &&
        String(r.categoryId || "") === String(x.categoryId || "")
      );

      if (existing) {
        updateById_("budgets", existing.id, {
          amount: Number(x.amount || 0),
          updatedAt: new Date().toISOString()
        });
      } else {
        append_("budgets", {
          id: x.id,
          month: x.month,
          categoryId: x.categoryId || "",
          amount: Number(x.amount || 0),
          updatedAt: new Date().toISOString()
        });
      }

      return json_({ ok: true });
    }

    return fail_("Unknown action", "UNKNOWN_ACTION");
  } catch (err) {
    return fail_(String(err), "SERVER_ERROR");
  }
}
