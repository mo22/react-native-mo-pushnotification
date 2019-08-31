export declare enum VibrateType {
    ImpactLight = "ImpactLight",
    ImpactMedium = "ImpactMedium",
    ImpactHeavy = "ImpactHeavy",
    NotificationError = "NotificationError",
    NotificationWarning = "NotificationWarning",
    NotificationSuccess = "NotificationSuccess",
    SelectionChanged = "SelectionChanged",
    System = "System"
}
export interface Module {
    vibrate(type: VibrateType): void;
}
export declare const Module: Module | undefined;
