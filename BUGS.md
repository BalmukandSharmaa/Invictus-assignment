# Bugs found

Add one section per issue. Bug 1 is filled in to show the format — fix it, then write what you changed. Copy the blank template for the rest.

Keep this file in the repo and **commit it** with your fixes.

---

## Bug 1

**How to reproduce:** Open the app. The expense list says “Newest first”. The first row is Wine (7 Mar). Board game (15 Mar) is further down.

**What is wrong:** The list is showing oldest expenses first. Newest should be at the top. Additionally, `dateValue` in `format.js` returned the raw date string/object without converting to a numeric timestamp, leading to invalid date subtractions.

**What I changed:** Updated `dateValue` and `parseDate` in `src/lib/format.js` to return numeric timestamps (`getTime()`) without timezone drift, and reversed the sort order in `src/components/ExpenseList.jsx` to `dateValue(b.date) - dateValue(a.date)`.

---

## Bug 2

**How to reproduce:** Look at the Balances panel for the default Goa weekend trip. Ben Okonkwo (who paid $276, more than his $217 share) is displayed in red as "owes $59.00". Aisha Khan (who paid $148, less than her $233.01 share) is displayed in green as "is owed $85.01".

**What is wrong:** The conditions and CSS classes in `BalancesPanel.jsx` were inverted: `bal > 0.005` (positive balance / in credit) was labeled as `owes` with class `owe`, while `bal < -0.005` (negative balance / in debt) was labeled as `is owed` with class `owed`.

**What I changed:** Swapped the conditions and labels in `src/components/BalancesPanel.jsx` so that positive balances (`bal > 0.005`) display `is owed` with class `owed` and negative balances (`bal < -0.005`) display `owes` with class `owe`.

---

## Bug 3

**How to reproduce:** Check the calculation in `src/lib/balances.js` for an expense where the payer is not part of `splitWith` (e.g., expense `e2` "Uber to airport" where Diya pays $60 for Aisha and Ben). Diya only received credit for $30 instead of $60.

**What is wrong:** `computeBalances` contained lines 16–19 which subtracted `amount / n` from the payer if `!(exp.paidBy in shares)`. Per the README ("Paying for other people. Someone can put a cab on their card even if they did not ride. They should get that fare back in full"), payers not on the split must get their payment back in full without deduction.

**What I changed:** Removed the erroneous subtraction block in `src/lib/balances.js` so payers not on the split receive their full credit back, maintaining zero-sum total balances across the group.

---

## Bug 4

**How to reproduce:** Calculate settlements where a debtor owes an amount exactly equal to what a creditor is owed (e.g. Carlos owes $16.99 and Diya is owed $16.99).

**What is wrong:** In `src/lib/settle.js`, when `d.amount === c.amount`, the `else` branch incremented both `i` and `j` (`i += 1; j += 1;`) without calling `transfers.push(...)`, causing the settlement transfer to be completely omitted and leaving both members unsettled.

**What I changed:** Added `transfers.push(...)` in the `else` branch of `suggestSettlements` in `src/lib/settle.js` so equal debtor-creditor balances generate their settlement transfer.

---

## Bug 5

**How to reproduce:** In the Filter panel, select any member from the "Paid by" dropdown (e.g., "Diya Patel" or "Aisha Khan").

**What is wrong:** The filter condition in `App.jsx` was `e.paidBy !== paidBy`. Because `paidBy` from the `<select>` element is a string (`"1"`) and `e.paidBy` in expenses is a number (`1`), strict inequality `!==` always evaluated to true, resulting in 0 expenses being displayed for every member.

**What I changed:** Updated the filter in `src/App.jsx` to compare string values `String(e.paidBy) !== String(paidBy)`.

---

## Bug 6

**How to reproduce:** Apply a filter or search (or rely on the sorted list), and click "Delete" or edit the amount of any expense in `ExpenseList`.

**What is wrong:** `ExpenseList.jsx` passed the sorted/filtered array index to `onDeleteAt` and `onUpdateAt`. In `store.js`, the reducer deleted/updated `state.expenses[action.index]`, which modified an entirely different expense in the master list. Additionally, `ExpenseRow` used array index as React `key`.

**What I changed:** Changed `DELETE_EXPENSE` and `UPDATE_EXPENSE` actions and handlers to identify expenses by `id` rather than array index (`action.id`), and set `key={expense.id}` in `src/components/ExpenseList.jsx`.

---

## Bug 7

**How to reproduce:** Split $100 equally among 3 people, or check expense `e9` (Wine $20 split with custom % 33.33, 33.33, 33.34). Also enter percentage values totaling 100% that produce IEEE-754 float representation (e.g. 33.33 + 33.33 + 33.34).

**What is wrong:** In `src/lib/money.js`, `splitEqual` simply rounded `amount / n` for each person, causing $100 / 3 to give $33.33 each ($99.99 total, losing 1 cent). `splitByPercent` similarly rounded each person independently. `percentsSumTo100` strictly checked `=== 100`, which could reject valid percentage splits due to floating point inaccuracies.

**What I changed:** In `src/lib/money.js`, updated `splitEqual` to allocate base cents and distribute remainder cents evenly across shares; updated `splitByPercent` to ensure total allocated cents exactly match total amount in cents; and updated `percentsSumTo100` to check `Math.abs(sum - 100) < 0.01`.

---

## Bug 8

**How to reproduce:** Reload the page after visiting the app. Date format in the expense list changes from formatted strings (e.g. "12 Mar 2026") to raw strings or slices.

**What is wrong:** `loadState` in `src/state/store.js` returned `JSON.parse(raw)` directly without running `hydrate()`. As a result, stored expenses had string dates instead of Date objects, breaking `date instanceof Date` checks.

**What I changed:** Updated `loadState` in `src/state/store.js` to return `hydrate(JSON.parse(raw))`, and made `formatDate` in `src/lib/format.js` robust against both string dates and Date objects.

---

## Bug 9

**How to reproduce:** Add a new member under "Add member" in the Summary section (e.g. "Elena Rostova").

**What is wrong:** The `perPerson` calculation in `SummaryCards.jsx` had `[expenses]` as its `useMemo` dependency array instead of `[members, expenses]`. Adding a new member did not update the "Paid so far" breakdown until an expense was changed.

**What I changed:** Updated the `useMemo` dependency array in `src/components/SummaryCards.jsx` to `[members, expenses]`.

---

## Bug 10

**How to reproduce:** Fill out the "Add expense" form with a description and amount, then click "Save expense".

**What is wrong:** The form did not clear `description`, `amount`, or errors upon successful addition, forcing the user to manually clear the inputs before entering another expense.

**What I changed:** Added state reset calls (`setDescription("")`, `setAmount("")`, `setError("")`) in `submit` inside `src/components/AddExpenseForm.jsx`.

---

## Bug 11

**How to reproduce:** Attempt to edit a group member's name or delete a member (e.g. if a name had a typo or an extra member was added).

**What is wrong:** The app provided no interface or state actions to edit or delete members in the group, and `store.js` lacked `UPDATE_MEMBER` and `DELETE_MEMBER` actions.

**What I changed:** Added `UPDATE_MEMBER` and `DELETE_MEMBER` reducer handlers in `src/state/store.js`, added member update/delete action handlers in `src/App.jsx` with safety checks against deleting members with recorded payments, and added inline name editing and delete controls to `PersonRow` in `src/components/SummaryCards.jsx`.

---

## Bug 12

**How to reproduce:** View an expense that is allocated to 1 person (or a subset of people) in the expense list.

**What is wrong:** The expense metadata displayed a generic and grammatically incorrect "split 1 ways" without showing who the cost was incurred for, leaving the story of who owes what unclear.

**What I changed:** Added `formatSplitMeta` in `src/components/ExpenseList.jsx` to explicitly show the person's name when an expense is for 1 member (e.g., `for Carlos (1 person)`), list member names for subset splits (e.g., `split 2 ways (Aisha, Diya)`), and show `split 4 ways (all)` when shared among the entire group.

---

## Bug 13

**How to reproduce:** Create or view an expense with a custom percentage split (e.g. Wine with 33.33%, 33.33%, 33.34%).

**What is wrong:** The expense list only showed "split 3 ways (Aisha, Ben, Carlos)", completely hiding that it was a custom percentage split and obscuring each participant's allocated percentage.

**What I changed:** Updated `formatSplitMeta` in `src/components/ExpenseList.jsx` to check if `splitType === "percent"` and display each member's exact percentage (e.g., `custom % (Aisha: 33.33%, Ben: 33.33%, Carlos: 33.34%)`).



