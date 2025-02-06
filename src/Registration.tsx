import { createContext, Dispatch, HTMLInputTypeAttribute, ReactNode, SetStateAction, useContext, useEffect, useState } from "react"
import { Form } from "react-router-dom"




type MyHTMLInputTypeAttribute = HTMLInputTypeAttribute

export type FormType = {
    firstname: string, lastname: string, email: string,
}





export type FormContextType = {
    form: FormType,
    setForm: Dispatch<SetStateAction<FormType>>
}

export const FormContext = createContext<FormContextType|null>(null)

export function FormContextProvider({ children } : { children: ReactNode}) {
    const [form,setForm] = useState<FormType>(() => { 
        const v = {
            email: "", firstname: "", lastname: ""
        }
        const raw = localStorage.getItem("st")
        const pv: Partial<FormData> = raw ? JSON.parse(raw) : {}        
        return { ...v, ...pv }
    })
    useEffect(() => {
        localStorage.setItem("st", JSON.stringify(form, null, 4))
    }, [form])
    return (<FormContext.Provider value={{ form, setForm }}>{children}</FormContext.Provider>)
}

export function useFormContext() {
    const o = useContext(FormContext)
    if (!o) {
        throw "context provider"
    }
    return o    
}



export function Registration() {
    const { form, setForm } = useFormContext()
    return (
        <form className="m-4 p-4 grid grid-cols-[auto_1fr] gap-2 items-baseline">
            <InputField id="i1" label="Firstname" value={form.firstname} onChange={(v) => {
                setForm({...form, firstname: v})
            }} />
            <InputField id="i2" label="Lastname" value={form.lastname} onChange={(v) => {
                setForm({...form, lastname: v})
            }} />
        </form>
    )
}
export function Registration2() {
    const { form, setForm } = useFormContext()
    return (
        <form className="m-4 p-4 grid grid-cols-[auto_1fr] gap-2 items-baseline">
            <InputField id="i2" label="Lastname" value={form.lastname} onChange={(v) => {
                setForm({...form, lastname: v})
            }} />
            <InputField type="email" id="i3" label="E-Mail" value={form.email} onChange={(v) => {
                setForm({...form, email: v})                
            }} 
                errorMessage={!form.email.endsWith(".de") && "Only german emails allowed."} />
        </form>
    )
}

export function ErrorMessage(props: { children: ReactNode}) {
    return (<div className="text-sm text-red-600">{props.children}</div>)
}

export type InputFieldProps = {
    id: string
    label: string
    errorMessage?: string | false
    value: string
    type?: MyHTMLInputTypeAttribute
    onChange: (v: string) => void
}
export function InputField(props: InputFieldProps) {
    const { id, label, errorMessage, value, type, onChange } = props
    return (
        <>
            <label htmlFor={id}>{label}</label>
            <div className="flex flex-col">
                <input id={id} value={value} type={type} onChange={(event) => {
                    onChange(event.target.value)
                }}/>
                {errorMessage && (<ErrorMessage>{errorMessage}</ErrorMessage>)}
            </div>
        </>
    )
}
