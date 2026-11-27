type SharedBadgeProps = {
  item: { isShared: boolean; isOwn: boolean };
};

// Marks custom content that is shared: your own shared items, or items another
// player has shared with everyone.
export default function SharedBadge({ item }: SharedBadgeProps) {
  if (!item.isShared) return null;

  return (
    <span
      className="shared-badge"
      title={
        item.isOwn ? "You share this with everyone" : "Shared by another player"
      }
    >
      {item.isOwn ? "Shared" : "Community"}
    </span>
  );
}
