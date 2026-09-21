export const en = {
  // Welcome
  welcome: {
    title: "Welcome to Kilnny",
    description: "Distribute and test Android apps effortlessly. Your private platform for sharing builds with your team.",
    getStarted: "Get Started",
  },

  // Auth
  auth: {
    login: "Login",
    loginTitle: "Log In",
    register: "Register",
    createAccount: "Create Account",
    email: "Email",
    password: "Password",
    name: "Name",
    fillAllFields: "Please fill in all fields",
    loginFailed: "Could not log in",
    registerFailed: "Could not register",
    dontHaveAccount: "Don't have an account?",
    signUp: "Sign Up",
    alreadyHaveAccount: "Already have an account?",
  },

  // Verify
  verify: {
    title: "Verify Email",
    subtitle: "Enter the 6-digit code we sent to",
    verify: "Verify",
    enterFullCode: "Enter the full 6-digit code",
    verified: "Verified",
    verifiedDesc: "Your email has been verified successfully.",
    continue: "Continue",
    invalidCode: "Invalid code",
    didntReceive: "Didn't receive the code?",
    resend: "Resend",
    sent: "Sent",
    sentDesc: "A new code has been sent to your email.",
    resendFailed: "Could not resend the code",
    verifyLater: "Verify later",
  },

  // Projects
  projects: {
    title: "Your Projects",
    noProjects: "No projects found",
    loadError: "Could not load projects",
    retry: "Retry",
    noBuilds: "No builds available",
    install: "Install",
    installed: "Installed",
    open: "Open",
    invitationCode: "Invitation Code",
    invitationDesc: "Enter the code you received to join a project.",
    invitationAccepted: "Invitation accepted",
    joinedProject: "You have successfully joined the project.",
    invalidCode: "Invalid or expired code",
    cancel: "Cancel",
    accept: "Accept",
    placeholder: "Ex: A1B2C3",
    pinned: "Pinned",
    pinLimit: "You can only pin up to 3 projects",
  },

  // Detail
  detail: {
    update: "Update",
    install: "Install",
    open: "Open",
    uninstall: "Uninstall",
    uninstallConfirm: "Are you sure you want to uninstall this app?",
    uninstallTitle: "Uninstall App",
    sendFeedback: "Send Feedback",
    whatToTest: "What to test?",
    description: "Description",
    info: "Information",
    developer: "Developer",
    date: "Date",
    version: "Version",
    size: "Size",
    previousBuilds: "Previous Builds",
    searchBuilds: "Search by build number or version...",
    loadingBuilds: "Loading builds...",
    noBuildsFound: "No builds found",
    noBuildsAvailable: "No builds available",
    noBuildError: "This project has no builds available",
    openNotAvailable: "Cannot open app — package name not available",
  },

  // Feedback
  feedback: {
    title: "Feedback",
    description: "Hi! 👋 We'd love to hear what you think about our app. Whether you have a brilliant idea, a complaint, or just want to say 'Hi!', we're here to listen. So don't be shy, leave us your feedback and let's make this app even more awesome together! 🚀",
    placeholder: "Write your feedback here...",
    send: "Send Feedback",
    emptyError: "Please write your feedback before sending.",
    noBuildError: "No associated build found.",
    sent: "Feedback sent",
    sentDesc: "Thanks for your feedback.",
    sendFailed: "Could not send feedback. Please try again.",
  },

  // Profile
  profile: {
    title: "My Profile",
    user: "User",
    settings: "Settings",
    editProfile: "Edit Profile",
    notifications: "Notifications",
    privacy: "Privacy & Security",
    logout: "Log Out",
    comingSoon: "Coming Soon",
    comingSoonDesc: "This feature will be available soon.",
    appVersion: "App Version",
    account: "Account",
    editTitle: "Edit profile",
    nameUpdated: "Profile updated",
    nameUpdatedDesc: "Your details were updated successfully.",
    save: "Save",
    currentPassword: "Current password",
    newPassword: "New password",
    confirmPassword: "Confirm password",
    changePassword: "Change password",
    passwordMismatch: "Passwords do not match",
    passwordUpdated: "Password updated",
    passwordUpdatedDesc: "Your password was updated successfully.",
    updateFailed: "Could not update your profile",
    passwordUpdateFailed: "Could not change your password",
    requiredName: "Name is required",
    picturePermission: "Photo access permission is required",
    pictureUploadFailed: "Could not upload the image",
    workspace: "Workspace",
    organizations: "Organizations",
    projects: "Projects",
    organization: "Organization",
    project: "Project",
    changePicture: "Change image",
    noOrganizations: "You have no organizations",
    workspaceLoadFailed: "Could not load your workspace",
    workspaceSaved: "Saved",
    workspaceSavedDesc: "Your changes were saved successfully.",
  },

  // Common
  common: {
    error: "Error",
    ok: "OK",
  },
} as const;

type Widen<T> = T extends string
  ? string
  : T extends object
  ? { [K in keyof T]: Widen<T[K]> }
  : T;

export type Translations = Widen<typeof en>;
