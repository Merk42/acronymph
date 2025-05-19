function ChooseCategory({ onCategory, categories }:{ onCategory: Function, categories: string[]}) {

    const chooseCategory = (entry:string) => {
        onCategory(entry);
    }
    return (
        <fieldset className="max-w-xl m-auto">
            <legend className="text-xl">Choose a category</legend>
            { categories.map((entry:string) => 
            <div key={entry} className="mt-4">
                <input
                    type="radio"
                    className="hidden peer"
                    name="votefor"
                    id={entry.replace(" ", "")}
                    value={entry}
                    onChange={() => {chooseCategory(entry)}}/>
                <label
                    htmlFor={entry.replace(" ", "")}
                    className="cursor-pointer border-blue-500 border-2 p-4 block rounded-md peer-checked:bg-blue-500 peer-checked:text-white peer-disabled:bg-gray-300 peer-disabled:border-gray-500 peer-disabled:cursor-not-allowed dark:peer-disabled:bg-gray-600">
                        {entry}
                </label>
            </div>
            )}
        </fieldset>
    )
}

export default ChooseCategory