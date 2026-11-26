import type { Character } from "../types/character";
import type { CustomWildShape, WildShape } from "../types/wildShape";
import WildShapeDetailsContent from "./WildShapeDetailsContent";
import { formatChallengeRating } from "../utils/formats";

type WildShapeItemProps = {
  wildShape: WildShape;
  isExpanded: boolean;
  onToggleDetails: () => void;
  onToggleFavorite: (key: string) => void;
  activeCharacter: Character | undefined;
  openCustomWildShapeDialog: (wildShape?: CustomWildShape | null) => void;
};

export default function WildShapeItem({
  wildShape,
  isExpanded,
  onToggleDetails,
  onToggleFavorite,
  activeCharacter,
  openCustomWildShapeDialog,
}: WildShapeItemProps) {
  const isFavorite =
    activeCharacter?.favoriteWildShapeKeys.includes(wildShape.key) ?? false;

  return (
    <>
      <tr>
        <td className="wild-shape-name">
          <button onClick={onToggleDetails} aria-expanded={isExpanded}>
            {wildShape.name}
            <span className="minus" aria-hidden="true">
              {isExpanded && "-"}
            </span>
          </button>
        </td>
        <td className="wild-shape-cr">
          <span>{formatChallengeRating(wildShape.challenge_rating)}</span>
        </td>
        <td className="wild-shape-favorite">
          <button
            className="favorite-btn"
            onClick={() => onToggleFavorite(wildShape.key)}
            aria-label="Toggle favorite"
          >
            {isFavorite ? "★" : "☆"}
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={3}>
            <section className="wild-shape-details">
              <WildShapeDetailsContent wildShape={wildShape} />
              {wildShape.isCustom && (
                <div className="button-wrapper custom-wild-shape-edit-btn">
                  <button
                    type="button"
                    className="small-btn"
                    onClick={() => openCustomWildShapeDialog(wildShape)}
                  >
                    Edit wild shape
                  </button>
                </div>
              )}
            </section>
          </td>
        </tr>
      )}
    </>
  );
}
