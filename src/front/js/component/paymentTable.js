import React, { useContext, useState, useEffect } from "react"
import { Context } from "../store/appContext";

export const PaymentTable = () => {
    const { actions, store } = useContext(Context)
    const [payments, setPayments] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await actions.getPayments();
                setPayments(data.payments);
            } catch (error) {
                console.error("Error fetching payments:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <table className="table" style={{fontFamily: 'Nanum Gothic, sans-serif'}}>
                <thead className="border" style={{ backgroundColor: '#bdb5b5', color: 'white' }}>
                    <tr style={{ fontWeight: 'normal' }}>
                        <th scope="col">Fecha</th>
                        <th scope="col">Monto</th>
                        <th scope="col">Concepto</th>
                    </tr>
                </thead>
                <tbody style={{backgroundColor:'white', color:'grey'}}>
                    {payments.map((payment, index) => (
                        <tr key={payment.id}>
                            <td>{new Date(payment.date).toLocaleDateString()}</td>
                            <td>${payment.amount}</td>
                            <td>{payment.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
       
    );
};