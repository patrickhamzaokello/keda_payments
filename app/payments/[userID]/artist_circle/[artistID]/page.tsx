import { NextRequest } from "next/server";
import Decimal from 'decimal.js';  // You'd need to install this package
import SubscriptionClient from './SubscriptionClient'

export default async function ArtistCirclePaymentsPage({
  params,
  searchParams,
}: {
  params: { userID: string; artistID: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { userID, artistID } = params;
  const amountString = searchParams.amount as string | undefined;

  // Validation functions
  const isValidUserID = (id: string) => /^mw[a-zA-Z0-9]+$/.test(id);
  const isValidArtistID = (id: string) => /^martist[a-zA-Z0-9]+$/.test(id);
  const isValidAmount = (amt: string | undefined): boolean => {
    if (!amt) return false;
    try {
      const decimalAmount = new Decimal(amt);
      return decimalAmount.isPositive() && decimalAmount.decimalPlaces() <= 2;
    } catch {
      return false;
    }
  };

  // Check for errors
  const errors = [];
  if (!isValidUserID(userID)) errors.push("Invalid user ID");
  if (!isValidArtistID(artistID)) errors.push("Invalid artist ID");
  if (!isValidAmount(amountString)) errors.push("Invalid or missing amount");

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

  // If no errors, parse the amount and display the payment page
  const amount = new Decimal(amountString!);

//   return (
//     <div>
//       Artist Payments Page for {userID} and artist ID {artistID} amount {amount.toFixed(2)}
//     </div>
//   );

return <SubscriptionClient />
}