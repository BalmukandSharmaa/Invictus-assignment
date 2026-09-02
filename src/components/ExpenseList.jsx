import { useEffect, useState } from "react";
import { formatMoney } from "../lib/money.js";
import { dateValue, formatDate } from "../lib/format.js";

function initials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatSplitMeta(expense, memberMap, totalMembersCount) {
  if (expense.splitType === "percent" && expense.percents) {
    const pcts = Object.entries(expense.percents)
      .map(([id, pct]) => {
        const m = memberMap[id];
        const name = m ? m.name.split(" ")[0] : `#${id}`;
        return `${name}: ${pct}%`;
      })
      .join(", ");
    return `custom % (${pcts})`;
  }

  const splitWith = expense.splitWith || [];
  const count = splitWith.length;

  if (count === 0) return "not split";
  if (count === 1) {
    const single = memberMap[splitWith[0]];
    const name = single ? single.name.split(" ")[0] : `#${splitWith[0]}`;
    return `for ${name} (1 person)`;
  }
  if (totalMembersCount && count === totalMembersCount) {
    return `split ${count} ways (all)`;
  }

  const names = splitWith
    .map((id) => {
      const m = memberMap[id];
      return m ? m.name.split(" ")[0] : `#${id}`;
    })
    .join(", ");

  return `split ${count} ways (${names})`;
}


function ExpenseRow({ expense, memberMap, totalMembersCount, onDelete, onSaveAmount }) {
  const [draft, setDraft] = useState(String(expense.amount));
  const payer = memberMap[expense.paidBy];

  useEffect(() => {
    setDraft(String(expense.amount));
  }, [expense.amount]);

  function handleSave() {
    const n = Number(draft);
    if (Number.isFinite(n) && n > 0) {
      if (n !== Number(expense.amount)) {
        onSaveAmount(n);
      }
    } else {
      setDraft(String(expense.amount));
    }
  }

  return (
    <article className="expense">
      <span className="avatar" style={{ background: payer?.color ?? "#888" }}>
        {payer ? initials(payer.name) : "?"}
      </span>
      <div>
        <div className="expense-title">
          {expense.description}
          <span className="cat">{expense.category}</span>
        </div>
        <div className="expense-meta">
          {payer?.name ?? "Unknown"} · {formatDate(expense.date)} ·{" "}
          {formatSplitMeta(expense, memberMap, totalMembersCount)}
        </div>

        <div className="actions">
          <input
            className="edit-amount"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSave();
                e.currentTarget.blur();
              } else if (e.key === "Escape") {
                setDraft(String(expense.amount));
                e.currentTarget.blur();
              }
            }}
            aria-label={`Edit amount for ${expense.description}`}
            title="Edit amount and press Enter or click away to save"
          />
          <button type="button" className="btn danger" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
      <div className="amount">{formatMoney(expense.amount)}</div>
    </article>
  );
}


export default function ExpenseList({
  expenses,
  members,
  onDelete,
  onUpdate,
}) {
  const [sortOrder, setSortOrder] = useState("newest");
  const memberMap = Object.fromEntries(members.map((m) => [m.id, m]));

  const sorted = [...expenses].sort((a, b) => {
    return sortOrder === "newest"
      ? dateValue(b.date) - dateValue(a.date)
      : dateValue(a.date) - dateValue(b.date);
  });

  return (
    <section className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
        <h2 style={{ margin: 0 }}>Expenses</h2>
        <div className="chips">
          <button
            type="button"
            className={`chip ${sortOrder === "newest" ? "on" : ""}`}
            onClick={() => setSortOrder("newest")}
          >
            Newest first
          </button>
          <button
            type="button"
            className={`chip ${sortOrder === "oldest" ? "on" : ""}`}
            onClick={() => setSortOrder("oldest")}
          >
            Oldest first
          </button>
        </div>
      </div>
      {sorted.length === 0 ? (
        <p className="empty">No expenses match these filters.</p>
      ) : (
        sorted.map((expense) => (
          <ExpenseRow
            key={expense.id}
            expense={expense}
            memberMap={memberMap}
            totalMembersCount={members.length}
            onDelete={() => onDelete(expense.id)}
            onSaveAmount={(amount) => onUpdate(expense.id, { amount })}
          />
        ))
      )}
    </section>
  );
}


