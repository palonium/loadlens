import ChoiceRypeTestCard from "../components/cards/ChoiceTypeTestCard";

export default function CreateChoicePage(){
    return(
        <div className="choice-page page">
            <ChoiceRypeTestCard title="А/В тест" image="./choice/1.png" to="/ab/create"/>
            <ChoiceRypeTestCard title="Сценарий" image="./choice/2.png" to="/create"/>
        </div>
    )
}