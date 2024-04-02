import React, { useState, useContext, useEffect } from 'react'
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'
import { Context } from "../../store/appContext.js"
import "./Product.module.css"
import big_logo from "../../../img/big_logo.png";

export const Product = () => {
    const { store, actions } = useContext(Context)
    const [preferenceIdLocal, setPreferenceIdLocal] = useState(null)
    const price = process.env.SERVICE_PRICE
    const description = process.env.SERVICE_DESCRIPTION

    initMercadoPago(process.env.MERCADOPAGO_PUBLICKEY, {
        locale: 'es-AR',
    });

    useEffect(() => {
        const fetchData = async () => {
            const id = await actions.createPreference()
            if (id) {
                setPreferenceIdLocal(store.preferenceId)
            }
        }
        fetchData();
    }, []);

    return (
        <div className='d-flex justify-content-center align-items-cernter' style={{ borderBottom: 'solid #FAFAFA 0.8vh', borderLeft: 'solid #FAFAFA 1vh', paddingLeft: '5vh', paddingBottom: '5vh', Width: '500vh' }}>
            <div className="container d-grid align-items-center">
                <div className='card-product' style={{ maxWidth: '100%', backgroundColor:'#FAFAFA' }}>
                    <div className="card d-flex align-items-center justify-content-center" >
                        <img className=" pb-4 pt-4" src={big_logo} alt='product stuff' style={{ maxWidth: '65%', paddingLeft: '3vh', paddingRight: '3vh' }} />
                        <div className='d-flex'>
                            <h5 style={{ marginRight: '2vh', fontFamily: "'Nanum Gothic', sans-serif", color: '#8A97A6', fontWeight: 'bolder' }}>Concepto: </h5>
                            <h5 style={{ fontFamily: "'Nanum Gothic', sans-serif", color: '#8A97A6' }}>Consulta psicologica</h5>
                        </div>
                        <div className='d-flex'>
                            <h5 style={{ marginRight: '2vh', fontFamily: "'Nanum Gothic', sans-serif", color: '#8A97A6', fontWeight: 'bolder' }}>{description}:</h5>
                            <h5 style={{ fontFamily: "'Nanum Gothic', sans-serif", color: '#8A97A6' }}>Total: ${price}</h5>
                        </div>
                        <div className="wallet-container pb-4">
                            {
                                preferenceIdLocal && <Wallet initialization={{ preferenceId: preferenceIdLocal.id }} />
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
