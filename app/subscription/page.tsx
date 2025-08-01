import { PricingTable } from "@clerk/nextjs"

const Subscription = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Subscription Plans</h1>
      <PricingTable
        appearance={{
          elements: {
            headerTitle: "Choose Your Plan",
            headerSubtitle: "Select the plan that suits you best",
          },
        }}
      />
    </div>
  )
}

export default Subscription
