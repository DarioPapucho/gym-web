
import React, { JSX } from "react"
import EmployeeList from "../components/EmployeeList"
import Navbar from "../components/Nav"


function Employees() :JSX.Element {
    return (
        <React.Fragment>
                <Navbar/>
                <EmployeeList />
        </React.Fragment>
       
    )
}

export default Employees