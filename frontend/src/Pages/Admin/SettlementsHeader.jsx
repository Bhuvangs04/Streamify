export const SettlementsHeader = ({ count }) => {
  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-2">Settlements</h1>
      <p className="text-gray-400">
        Showing {count} settlement{count !== 1 ? "s" : ""}
      </p>
      <p className="mt-2 justify-between text-blue-400 text-sm font-medium">
        Settlements are automatically generated every 24 hours and are based on
        the previous day's transactions.
      </p>
      <p className="mt-2 text-blue-400 text-sm justify-between font-medium">
        Please note that settlements are only generated for transactions that
        are older than 7 days.
      </p>
      <p className="mt-1 text-sm text-white-400">
        Please Note Only 10 Transaction can be seen. If u want more means Please
        check the Razorpay account about settlements
      </p>
    </div>
  );
};
