import { UserManager } from "https://cdn.jsdelivr.net/npm/oidc-client-ts/+esm";
import { cognitoConfig } from "./config.js";

export const userManager = new UserManager({
    authority: cognitoConfig.authority,
    client_id: cognitoConfig.clientId,
    redirect_uri: cognitoConfig.redirectUri,
    response_type: "code",
    scope: cognitoConfig.scope
});

export function login() {
    const { clientId, redirectUri, cognitoDomain, scope } = cognitoConfig;

    const loginUrl =
        `${cognitoDomain}/login` +
        `?client_id=${clientId}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(scope)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}`;

    window.location.href = loginUrl;
}

export function logout() {
    const { clientId, logoutUri, cognitoDomain } = cognitoConfig;

    const logoutUrl =
        `${cognitoDomain}/logout` +
        `?client_id=${clientId}` +
        `&logout_uri=${encodeURIComponent(logoutUri)}`;

    window.location.href = logoutUrl;
}

export function register() {
    const { clientId, redirectUri, cognitoDomain, scope } = cognitoConfig;

    const signupUrl =
        `${cognitoDomain}/signup` +
        `?client_id=${clientId}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(scope)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}`;

    window.location.href = signupUrl;
}

