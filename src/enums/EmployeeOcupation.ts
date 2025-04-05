enum CargoEmpleado {
    SinAcceso = 0,        // StaffWithNotAccess
    AdminBasico = 1,      // AdministratorWithMembers
    AdminMedio = 2,       // AdministratorWithMembersMemberships
    AdminCompleto = 3,    // AdministratorWithMembersMembershipsEmployee
    Entrenador = 4        // Trainer
}
export default CargoEmpleado;