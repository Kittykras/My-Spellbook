-- Custom spells / wild shapes can be shared with every user.
ALTER TABLE custom_spells ADD COLUMN is_shared INTEGER NOT NULL DEFAULT 0;
ALTER TABLE custom_wild_shapes ADD COLUMN is_shared INTEGER NOT NULL DEFAULT 0;

CREATE INDEX custom_spells_shared ON custom_spells(is_shared) WHERE is_shared = 1;
CREATE INDEX custom_wild_shapes_shared ON custom_wild_shapes(is_shared) WHERE is_shared = 1;

-- Shared content appears next to everyone's own content, and favorites/card texts
-- refer to it by id alone, so ids must be unique across all users.
CREATE UNIQUE INDEX custom_spells_id ON custom_spells(id);
CREATE UNIQUE INDEX custom_wild_shapes_id ON custom_wild_shapes(id);
