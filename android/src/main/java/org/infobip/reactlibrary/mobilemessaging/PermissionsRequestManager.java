package org.infobip.reactlibrary.mobilemessaging;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;

import androidx.annotation.NonNull;
import androidx.annotation.StringRes;
import androidx.collection.ArraySet;

import com.facebook.react.modules.core.PermissionAwareActivity;
import com.facebook.react.modules.core.PermissionListener;

import org.infobip.mobile.messaging.R;
import org.infobip.mobile.messaging.logging.MobileMessagingLogger;
import org.infobip.mobile.messaging.permissions.PermissionsHelper;

import java.util.Set;

public class PermissionsRequestManager {
    public interface PermissionsRequester {

        /**
         * This method will be called when required permissions are granted.
         */
        void onPermissionGranted();

        /**
         * Provide permissions which you need to request.
         * <br>
         * For example:
         * <pre>
         * {@code
         * new String[]{Manifest.permission.CAMERA}
         * </pre>
         **/
        @NonNull
        String[] requiredPermissions();

        /**
         * Should application show the dialog with information that not all required permissions are granted and button which leads to the settings for granting permissions after it was already shown once.
         * Recommendations:
         * - If you are asking for permissions by button tap, better to return true, so user will be informed, why an action can't be done, if the user didn't grant the permissions.
         * - If you are asking for permissions on the application start, without any additional user actions, better to return false not to disturb the user constantly.
         **/
        boolean shouldShowPermissionsNotGrantedDialogIfShownOnce();

        /**
         * This method is for providing custom title for the permissions dialog.
         *
         * @return reference to string resource for permissions dialog title
         */
        @StringRes
        int permissionsNotGrantedDialogTitle();

        /**
         * This method is for providing custom message for the permissions dialog.
         *
         * @return reference to string resource for permissions dialog message
         */
        @StringRes
        int permissionsNotGrantedDialogMessage();
    }

    protected PermissionsRequester permissionsRequester;
    protected PermissionsHelper permissionsHelper;
    protected static final int REQ_CODE_POST_NOTIFICATIONS_PERMISSIONS = 10000;

    public PermissionsRequestManager(@NonNull PermissionsRequester permissionsRequester) {
        this.permissionsRequester = permissionsRequester;
        this.permissionsHelper = new PermissionsHelper();
    }

    public void onRequestPermissionsResult(String[] permissions, int[] grantResults) {
        for (int result : grantResults) {
            if (result == -1) return;
        }
        permissionsRequester.onPermissionGranted();
    }

    public boolean isRequiredPermissionsGranted(PermissionAwareActivity activity, PermissionListener listener) {
        final Set<String> permissionsToAsk = new ArraySet<>();
        final Set<String> neverAskPermissions = new ArraySet<>();

        for (String permission : permissionsRequester.requiredPermissions()) {
            if (!permissionsHelper.hasPermissionInManifest((Activity) activity, permission)) {
                return false;
            }
            checkPermission(activity, permission, permissionsToAsk, neverAskPermissions);
        }

        if (neverAskPermissions.size() > 0) {
            showSettingsDialog(activity, new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    openSettings((Activity) activity);
                    dialog.dismiss();
                }
            }, neverAskPermissions.toString());
            return false;
        }
        String[] permissionsToAskArray = new String[permissionsToAsk.size()];
        permissionsToAsk.toArray(permissionsToAskArray);
        if (permissionsToAsk.size() > 0) {
            activity.requestPermissions(permissionsToAskArray, REQ_CODE_POST_NOTIFICATIONS_PERMISSIONS, listener);
            return false;
        }
        return true;
    }

    protected void checkPermission(PermissionAwareActivity activity, String permission, final Set<String> permissionsToAsk, final Set<String> neverAskPermissions) {
        permissionsHelper.checkPermission((Activity) activity, permission, new PermissionsHelper.PermissionsRequestListener() {
            @Override
            public void onNeedPermission(Activity activity, String permission) {
                permissionsToAsk.add(permission);
            }

            @Override
            public void onPermissionPreviouslyDeniedWithNeverAskAgain(Activity activity, String permission) {
                neverAskPermissions.add(permission);
            }

            @Override
            public void onPermissionGranted(Activity activity, String permission) {
            }
        });
    }

    protected void showSettingsDialog(PermissionAwareActivity activity, DialogInterface.OnClickListener onPositiveButtonClick, String permission) {
        if (!permissionsHelper.isPermissionSettingsDialogShown((Activity) activity, permission) ||
                permissionsRequester.shouldShowPermissionsNotGrantedDialogIfShownOnce()) {
            AlertDialog.Builder builder = new AlertDialog.Builder((Activity) activity)
                    .setMessage(permissionsRequester.permissionsNotGrantedDialogMessage())
                    .setTitle(permissionsRequester.permissionsNotGrantedDialogTitle())
                    .setPositiveButton(R.string.mm_button_settings, onPositiveButtonClick)
                    .setNegativeButton(R.string.mm_button_cancel, new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            dialog.dismiss();
                        }
                    });
            builder.show();
            permissionsHelper.setPermissionSettingsDialogShown((Activity) activity, permission, true);
        }
    }

    protected void openSettings(Activity activity) {
        MobileMessagingLogger.d("Will open application settings activity");
        Intent intent = new Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        Uri uri = Uri.fromParts("package", activity.getPackageName(), null);
        intent.setData(uri);
        if (intent.resolveActivity(activity.getPackageManager()) != null) {
            activity.startActivity(intent);
        }
    }
}
