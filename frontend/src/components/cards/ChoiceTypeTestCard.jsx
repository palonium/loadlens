import { NavLink } from "react-router-dom";

export default function ChoiceRypeTestCard({ title, image, to }) {
    return (
        <NavLink to={to} className="card card-choice-type navlink">
            <img src={image} alt={title} className="card-choice-type__img" />
            <h2 className="card-choice-type__title font-base base-color-text">{title}</h2>
        </NavLink>
    );
}
