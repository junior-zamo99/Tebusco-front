export type DialogType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface DialogConfig {
  type: DialogType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  icon?: string;
}

export interface DialogResult {
  confirmed: boolean;
  cancelled: boolean;
}
