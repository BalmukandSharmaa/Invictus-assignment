import { parseDate } from "../lib/format.js";

const KEY = "fairshare-v1";

function hydrate(data) {
  return {
    groupName: data.groupName,
    members: (data.members || []).map((m) => ({ ...m })),
    expenses: (data.expenses || []).map((e) => ({
      ...e,
      date: parseDate(e.date),
    })),
  };
}

export function loadState(seed) {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const initial = hydrate(seed);
      localStorage.setItem(KEY, JSON.stringify(initial));
      return initial;
    }
    return hydrate(JSON.parse(raw));
  } catch {
    return hydrate(seed);
  }
}

export function persistState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function nextExpenseId() {
  return `e-${Date.now()}`;
}

export function nextMemberId(members) {
  const max = members.reduce((m, x) => (x.id > m ? x.id : m), 0);
  return max + 1;
}

export function reducer(state, action) {
  switch (action.type) {
    case "ADD_EXPENSE": {
      return { ...state, expenses: [...state.expenses, action.expense] };
    }
    case "DELETE_EXPENSE": {
      if (action.id !== undefined) {
        return {
          ...state,
          expenses: state.expenses.filter((e) => e.id !== action.id),
        };
      }
      if (typeof action.index === "number") {
        const next = state.expenses.slice();
        next.splice(action.index, 1);
        return { ...state, expenses: next };
      }
      return state;
    }
    case "UPDATE_EXPENSE": {
      if (action.id !== undefined) {
        return {
          ...state,
          expenses: state.expenses.map((e) =>
            e.id === action.id ? { ...e, ...action.patch } : e
          ),
        };
      }
      if (typeof action.index === "number") {
        const next = state.expenses.slice();
        next[action.index] = { ...next[action.index], ...action.patch };
        return { ...state, expenses: next };
      }
      return state;
    }
    case "ADD_MEMBER": {
      return { ...state, members: [...state.members, action.member] };
    }
    case "UPDATE_MEMBER": {
      return {
        ...state,
        members: state.members.map((m) =>
          m.id === action.id ? { ...m, name: action.name } : m
        ),
      };
    }
    case "DELETE_MEMBER": {
      return {
        ...state,
        members: state.members.filter((m) => m.id !== action.id),
        expenses: state.expenses.map((e) => ({
          ...e,
          splitWith: (e.splitWith || []).filter((id) => id !== action.id),
        })),
      };
    }
    default:
      return state;

  }
}

