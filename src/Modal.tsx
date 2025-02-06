import { ReactNode } from "react"

export function Modal({ show, title, onClose, children }: {
    show: boolean
    title: string
    onClose: () => void
    children: ReactNode
}) {
    if (!show) {
        return null
    }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 motion-preset-fade ">
            <div className="bg-white rounded-lg shadow-lg motion-preset-expand" style={{ width: "calc(min(800px,60vw))" }}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 text-xl">
                        &times;
                    </button>
                </div>
                <div className="p-4">
                    {children}
                </div>
                <div className="flex justify-end p-4 border-t">
                    <button onClick={onClose} className="largebutton">
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}