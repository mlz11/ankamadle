import type { GuessResult } from '../../types';
import AttributeCell from './AttributeCell';

interface Props {
  result: GuessResult;
  isNew?: boolean;
}

export default function GuessRow({ result, isNew }: Props) {
  return (
    <div className={`guess-row ${isNew ? 'guess-row-new' : ''}`}>
      <div className="guess-monster-name">{result.monster.name}</div>
      <div className="guess-cells">
        <AttributeCell label="Type" feedback={result.feedback.type} />
        <AttributeCell label="Zone" feedback={result.feedback.zone} />
        <AttributeCell label="Niveau" feedback={result.feedback.niveau} />
        <AttributeCell label="Couleur" feedback={result.feedback.couleur} />
        <AttributeCell label="PV" feedback={result.feedback.pv} />
      </div>
    </div>
  );
}
