
export function App() {
    return (
        <div className="bg-gray-200 flex flex-col gap-2 w-full h-full">
            <MyForm></MyForm>
        </div>
    )
}

import { ChangeEvent, FormEvent, Fragment, HTMLInputTypeAttribute, useState } from 'react'

interface FormType {
    name: string,
    firstName: string,
    email: string,
    country: string
}
type IdType = keyof FormType

type FormSpec = { id: IdType, type: HTMLInputTypeAttribute, label: string}
const formSpec: FormSpec[] = [
    { id: "name", type: "text", label: "Name" },
    { id: "firstName", type: "text", label: "Vorname" },
    { id: "email", type: "email", label: "Nachname" },
    { id: "country", type: "text", label: "Land" },
]


export function MyForm() {
    const [ form, setForm ] = useState<FormType>({
        name: "", firstName: "", email: "", country: ""
    })

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        console.log("form object:", form)
    }
    let error = ""
    if (form.name.length <= 4) {
        error = "Name zu kurz"
    }
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        // shallow copy
        const newForm = { ...form, [e.target.id]: e.target.value }
        setForm(newForm)
    }
    console.log(form)

    return (
        <form onSubmit={handleSubmit} className="p-4 m-4 w-64 flex flex-col gap-2 bg-white rounded-lg shadow-xl">
            {formSpec.map(s => (
                <Fragment key={s.id}>
                    <label htmlFor={s.id}>{s.label}:</label>
                    <input id={s.id} type={s.type} value={form[s.id]} onChange={handleChange} />
                </Fragment>
            ))}
            <button type="submit">Submit</button>
            <div className="text-red-700 font-bold">{error}</div>
        </form>
    )
}