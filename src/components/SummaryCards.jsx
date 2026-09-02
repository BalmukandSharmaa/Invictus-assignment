import { useMemo, useState } from "react";
import { formatMoney } from "../lib/money.js";
import { totalSpent } from "../lib/balances.js";

function PersonRow({ person, onUpdateMember, onDeleteMember }) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(person.name);

  function handleSave() {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== person.name && onUpdateMember) {
      onUpdateMember(person.id, trimmed);
    } else {
      setDraftName(person.name);
    }
    setEditing(false);
  }

  return (
    <div className="person-stat" key={person.id}>
      {editing ? (
        <div style={{ display: "flex", gap: "6px", alignItems: "center", flex: 1, marginRight: "8px" }}>
          <input
            style={{ padding: "2px 6px", fontSize: "13px", flex: 1 }}
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") {
                setDraftName(person.name);
                setEditing(false);
              }
            }}
            autoFocus
          />
          <button type="button" className="btn" style={{ padding: "2px 8px", fontSize: "11px" }} onClick={handleSave}>
            Save
          </button>
          <button
            type="button"
            className="btn ghost"
            style={{ padding: "2px 8px", fontSize: "11px" }}
            onClick={() => {
              setDraftName(person.name);
              setEditing(false);
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span>{person.name}</span>
          {onUpdateMember && (
            <button
              type="button"
              className="btn ghost"
              style={{ padding: "1px 6px", fontSize: "10px", lineHeight: "14px" }}
              onClick={() => setEditing(true)}
              title={`Edit name of ${person.name}`}
            >
              Edit
            </button>
          )}
          {onDeleteMember && (
            <button
              type="button"
              className="btn danger"
              style={{ padding: "1px 6px", fontSize: "10px", lineHeight: "14px" }}
              onClick={() => onDeleteMember(person.id)}
              title={`Delete ${person.name}`}
            >
              Delete
            </button>
          )}
        </div>
      )}
      <span>{formatMoney(person.paid)}</span>
    </div>
  );
}

export default function SummaryCards({
  members,
  expenses,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
}) {
  const [name, setName] = useState("");

  const perPerson = useMemo(() => {
    return members.map((m) => {
      const paid = expenses
        .filter((e) => e.paidBy === m.id)
        .reduce((s, e) => s + Number(e.amount), 0);
      return { id: m.id, name: m.name, paid };
    });
  }, [members, expenses]);

  const spent = totalSpent(expenses);

  return (
    <section className="card">
      <h2>Summary</h2>
      <div className="summary-grid">
        <div className="stat">
          Expenses
          <b>{expenses.length}</b>
        </div>
        <div className="stat">
          Group total
          <b>{formatMoney(spent)}</b>
        </div>
        <div className="stat">
          Members
          <b>{members.length}</b>
        </div>
        <div className="stat">
          Avg / person
          <b>{formatMoney(members.length ? spent / members.length : 0)}</b>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <div className="legend">Paid so far</div>
        {perPerson.map((p) => (
          <PersonRow
            key={p.id}
            person={p}
            onUpdateMember={onUpdateMember}
            onDeleteMember={onDeleteMember}
          />
        ))}
      </div>
      <form
        style={{ marginTop: 12 }}
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = name.trim();
          if (!trimmed) return;
          onAddMember(trimmed);
          setName("");
        }}
      >
        <div className="row">
          <div className="field">
            <label htmlFor="newMember">Add member</label>
            <input
              id="newMember"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
            />
          </div>
          <button className="btn ghost" type="submit" style={{ alignSelf: "end" }}>
            Add
          </button>
        </div>
      </form>
    </section>
  );
}

