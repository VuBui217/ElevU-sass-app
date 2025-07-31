import CompanionForm from "@/components/CompanionForm"

/**
 * This page to build a new companion
 * @returns 
 */
const NewCompanion = () => {
  return (
      <main className="min-lg:w-1/3 min-md:w-2/3 items-center justify-center">
        <article className="w-full gap-4 flex flex-col">
            <h1 className="text-center">Companion Builder</h1>
            <CompanionForm/>
        </article>
      </main>
  )
}

export default NewCompanion
