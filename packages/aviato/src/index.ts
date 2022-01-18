class Person {
    name:String;
    constructor (name:String) {
        this.name = name
    }
    getName():String {
        return this.name;
    }
    setName(newName:String) {
        this.name = newName;
    }
}

export default Person;