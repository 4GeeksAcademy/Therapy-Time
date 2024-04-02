import React, { useContext, useState } from "react"
import { Product } from "../component/product/Product.jsx"
import { Context } from "../store/appContext.js"

export const Payment = () => {
    const { actions, store } = useContext(Context)

    return (
        <div className="d-flex align-items-center justify-content-center" style={{ backgroundColor: '#EDE9E9', height: '87.8vh'}}>
            <Product />
        </div>
    )
}