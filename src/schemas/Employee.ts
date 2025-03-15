class Employee {
  public id: number;
  public name: string;
  public lastname: string;
  public password: string;
  public ci: string;
  public phone: string;
  public salary: number;
  public lastPayment: Date;
  public workInDays: number;
  public ocupation: number;
  public trainer: string;

  constructor(
    id: number,
    name: string,
    lastname: string,
    password: string,
    ci: string,
    phone: string,
    salary: number,
    lastPayment: string,
    workInDays: number,
    ocupation: number,
    trainer: string
  ) {
    this.id = id;
    this.name = name;
    this.lastname = lastname;
    this.password = password;
    this.ci = ci;
    this.phone = phone;
    this.salary = salary;
    this.lastPayment = new Date(lastPayment);
    this.workInDays = workInDays;
    this.ocupation = ocupation === null ? 0 : ocupation;
    this.trainer = trainer;
  }

  getFormattedSalary(): string {
    return new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency: "BOB",
    }).format(this.salary);
  }

  getFormattedLastPayment(): string {
    return this.lastPayment.toDateString();
  }
}

export default Employee;

