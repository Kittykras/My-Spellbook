type HeaderProps = {
  userEmail?: string;
  onLogout?: () => void;
};

export default function Header({ userEmail, onLogout }: HeaderProps) {
  return (
    <>
      {userEmail && onLogout && (
        <div className="account-bar">
          <span>{userEmail}</span>
          <button type="button" className="small-btn" onClick={onLogout}>
            Log out
          </button>
        </div>
      )}
      <header>
        <h1>My Spellbook</h1>
        <p>Your personal collection of spells</p>
      </header>
    </>
  );
}
