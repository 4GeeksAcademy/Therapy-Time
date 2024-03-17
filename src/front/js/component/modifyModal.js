import React, { useContext } from "react";
import { Context } from "../store/appContext";

export const ModifyModal = () => {
    const { actions } = useContext(Context)
    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedTime, setSelectedTime] = useState(null)

    const date = new Date()
    const currentDate = date.getDay() + "/" + date.getMonth() + "/" + date.getFullYear()
    const formatedDate = new Date(selectedDate).toISOString().slice(0, 10)

    const handleSubmit = async () => {
        try {
            await actions.modifyNextAppointment(formatedDate, selectedTime)
        } catch (error) {
            console.error("Error al modificar el turno: ", error)
        }
    }

    return (
        <div className="modal" tabIndex="-1" id="modify" style={{ backgroundColor: 'white', border: 'none', color: 'grey', border: 'solid rgb(218, 217, 217) 0.5vh', fontFamily: 'Nanum Gothic' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Modificar turno</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <input
                            type="calendar"
                            placeholder={currentDate}
                            label="Seleccione una fecha"
                            onChange={(event) => setSelectedDate(event.target.value)}
                        />
                        <input
                            type="time"
                            placerholder="9:00"
                            label="Seleccione un horario"
                            onChange={(event) => setSelectedTime(event.target.value)}
                        />
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" onClick={handleSubmit}>Confirmar</button>
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    </div>
                </div>
            </div>
        </div>
    )
}