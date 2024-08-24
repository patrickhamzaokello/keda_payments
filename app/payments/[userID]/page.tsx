
import { NextRequest } from "next/server";
import Decimal from 'decimal.js';  // You'd need to install this package
import SubscriptionClient from './SubscriptionClient'

export default async function UserPaymentsPage({
  params,
}: {
  params: { userID: string };
}) {
  const { userID } = params;

  // Validation functions
  const isValidUserID = (id: string) => /^mw[a-zA-Z0-9]+$/.test(id);
  

  // Check for errors
  const errors = [];
  if (!isValidUserID(userID)) errors.push("Invalid user ID");

  // If there are errors, display them
  if (errors.length > 0) {
    return (
      <div>
        <h1>Error</h1>
        <ul>
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </div>
    );
  }

return <SubscriptionClient />
}