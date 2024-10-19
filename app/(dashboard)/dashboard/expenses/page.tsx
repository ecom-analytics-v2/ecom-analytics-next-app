import { ExpensePieChart } from "./expense-pie-chart";
import { ExpenseAreaChart } from "./expense-area-chart";
import { DateRangeProvider } from "@/components/dashboard/date-range-context";
import { ExpenseFilterProvider, ExpenseFilter } from "./expense-filter";
import { ExpenseTable } from "./expense-table";

// Updated Expense interface
interface Expense {
  name: string;
  type:
    | "Fixed Cost"
    | "Variable Cost"
    | "Staff"
    | "Software"
    | "Marketing"
    | "Operating Expenses"
    | "Taxes"
    | "Other";
  amount: number;
  amount_type: "dollar" | "percentage";
  dollar_amount: number;
  percentage_amount: number;
}

// Updated expenses array with new fields
const expenses: Expense[] = [
  // Fixed Costs
  {
    name: "Rent",
    type: "Fixed Cost",
    amount: 5000,
    amount_type: "dollar",
    dollar_amount: 5000,
    percentage_amount: 10.42,
  },
  {
    name: "Insurance",
    type: "Fixed Cost",
    amount: 1000,
    amount_type: "dollar",
    dollar_amount: 1000,
    percentage_amount: 2.08,
  },
  {
    name: "Equipment Lease",
    type: "Fixed Cost",
    amount: 1500,
    amount_type: "dollar",
    dollar_amount: 1500,
    percentage_amount: 3.13,
  },

  // Variable Costs
  {
    name: "Raw Materials",
    type: "Variable Cost",
    amount: 15,
    amount_type: "percentage",
    dollar_amount: 7200,
    percentage_amount: 15,
  },
  {
    name: "Shipping",
    type: "Variable Cost",
    amount: 8.5,
    amount_type: "dollar",
    dollar_amount: 8.5,
    percentage_amount: 0.02,
  },
  {
    name: "Packaging",
    type: "Variable Cost",
    amount: 2,
    amount_type: "dollar",
    dollar_amount: 2,
    percentage_amount: 0.004,
  },

  // Staff
  {
    name: "Salaries",
    type: "Staff",
    amount: 25000,
    amount_type: "dollar",
    dollar_amount: 25000,
    percentage_amount: 52.08,
  },
  {
    name: "Employee Benefits",
    type: "Staff",
    amount: 5000,
    amount_type: "dollar",
    dollar_amount: 5000,
    percentage_amount: 10.42,
  },
  {
    name: "Contractor Payments",
    type: "Staff",
    amount: 3000,
    amount_type: "dollar",
    dollar_amount: 3000,
    percentage_amount: 6.25,
  },

  // Software
  {
    name: "CRM Subscription",
    type: "Software",
    amount: 199,
    amount_type: "dollar",
    dollar_amount: 199,
    percentage_amount: 0.04,
  },
  {
    name: "Accounting Software",
    type: "Software",
    amount: 50,
    amount_type: "dollar",
    dollar_amount: 50,
    percentage_amount: 0.01,
  },
  {
    name: "Design Tools",
    type: "Software",
    amount: 75,
    amount_type: "dollar",
    dollar_amount: 75,
    percentage_amount: 0.02,
  },

  // Marketing
  {
    name: "Social Media Ads",
    type: "Marketing",
    amount: 1000,
    amount_type: "dollar",
    dollar_amount: 1000,
    percentage_amount: 2.08,
  },
  {
    name: "Email Marketing Platform",
    type: "Marketing",
    amount: 150,
    amount_type: "dollar",
    dollar_amount: 150,
    percentage_amount: 0.03,
  },
  {
    name: "Influencer Partnerships",
    type: "Marketing",
    amount: 2000,
    amount_type: "dollar",
    dollar_amount: 2000,
    percentage_amount: 4.17,
  },

  // Operating Expenses
  {
    name: "Utilities",
    type: "Operating Expenses",
    amount: 800,
    amount_type: "dollar",
    dollar_amount: 800,
    percentage_amount: 1.67,
  },
  {
    name: "Office Supplies",
    type: "Operating Expenses",
    amount: 200,
    amount_type: "dollar",
    dollar_amount: 200,
    percentage_amount: 0.42,
  },
  {
    name: "Maintenance",
    type: "Operating Expenses",
    amount: 500,
    amount_type: "dollar",
    dollar_amount: 500,
    percentage_amount: 1.04,
  },

  // Taxes
  {
    name: "Income Tax",
    type: "Taxes",
    amount: 20,
    amount_type: "percentage",
    dollar_amount: 10000,
    percentage_amount: 20,
  },
  {
    name: "Sales Tax",
    type: "Taxes",
    amount: 8.5,
    amount_type: "percentage",
    dollar_amount: 4250,
    percentage_amount: 8.5,
  },
  {
    name: "Property Tax",
    type: "Taxes",
    amount: 3000,
    amount_type: "dollar",
    dollar_amount: 3000,
    percentage_amount: 6.25,
  },

  // Other
  {
    name: "Legal Fees",
    type: "Other",
    amount: 1500,
    amount_type: "dollar",
    dollar_amount: 1500,
    percentage_amount: 3.13,
  },
  {
    name: "Professional Development",
    type: "Other",
    amount: 500,
    amount_type: "dollar",
    dollar_amount: 500,
    percentage_amount: 1.04,
  },
  {
    name: "Miscellaneous",
    type: "Other",
    amount: 300,
    amount_type: "dollar",
    dollar_amount: 300,
    percentage_amount: 0.63,
  },
];

export default function Dashboard() {
  return (
    <DateRangeProvider>
      <ExpenseFilterProvider>
        <div className="flex min-h-screen w-full flex-col bg-muted/40 relative overflow-y-auto">
          <div className="flex flex-col sm:gap-4 sm:py-4">
            <main className="relative flex-1 gap-4 px-4 sm:px-6 items-center md:gap-8 ">
              <ExpenseFilter />

              <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 items-end ">
                  <div className="sm:col-span-3">
                    <ExpenseAreaChart expenses={expenses} />
                  </div>

                  <div className="sm:col-span-1 w-full">
                    <ExpensePieChart orders={expenses} />
                  </div>
                </div>

                <ExpenseTable orders={expenses} />
              </div>
              <div></div>
            </main>
          </div>
        </div>
      </ExpenseFilterProvider>
    </DateRangeProvider>
  );
}
