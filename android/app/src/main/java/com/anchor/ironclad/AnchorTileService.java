package com.anchor.ironclad;

import android.content.Intent;
import android.service.quicksettings.Tile;
import android.service.quicksettings.TileService;

/**
 * Quick Settings Tile for Anchor Timer
 * Allows users to quickly open Anchor app from Samsung One UI Quick Panel
 */
public class AnchorTileService extends TileService {

    @Override
    public void onStartListening() {
        super.onStartListening();
        updateTileState();
    }

    @Override
    public void onClick() {
        super.onClick();

        // Open the main activity when tile is tapped
        Intent launchIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
        if (launchIntent != null) {
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivityAndCollapse(launchIntent);
        }
    }

    private void updateTileState() {
        Tile tile = getQsTile();
        if (tile == null)
            return;

        tile.setState(Tile.STATE_INACTIVE);
        tile.setLabel("Anchor");
        tile.setContentDescription("Open Anchor app");

        tile.updateTile();
    }

    @Override
    public void onTileAdded() {
        super.onTileAdded();
        updateTileState();
    }

    @Override
    public void onTileRemoved() {
        super.onTileRemoved();
    }

    @Override
    public void onStopListening() {
        super.onStopListening();
    }
}
