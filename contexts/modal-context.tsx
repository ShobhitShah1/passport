import React, { createContext, useContext, useState, ReactNode } from "react";
import UniversalModal, {
  ModalType,
} from "../components/modals/universal-modal";

interface ModalButton {
  text: string;
  onPress: () => void;
  style?: "primary" | "secondary" | "danger";
}

interface ModalOptions {
  type: ModalType;
  title: string;
  message: string;
  buttons?: ModalButton[];
  autoClose?: boolean;
  autoCloseDelay?: number;
}

interface ModalContextType {
  showModal: (options: ModalOptions) => void;
  hideModal: () => void;
  showSuccess: (title: string, message: string, autoClose?: boolean) => void;
  showError: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [modalState, setModalState] = useState<{
    visible: boolean;
    options: ModalOptions;
  }>({
    visible: false,
    options: {
      type: "info",
      title: "",
      message: "",
    },
  });

  const showModal = (options: ModalOptions) => {
    setModalState({
      visible: true,
      options,
    });
  };

  const hideModal = () => {
    setModalState((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  const showSuccess = (
    title: string,
    message: string,
    autoClose: boolean = true
  ) => {
    showModal({
      type: "success",
      title,
      message,
      autoClose,
      autoCloseDelay: 2000,
      buttons: [{ text: "Great!", onPress: hideModal, style: "primary" }],
    });
  };

  const showError = (title: string, message: string) => {
    showModal({
      type: "error",
      title,
      message,
      buttons: [{ text: "OK", onPress: hideModal, style: "danger" }],
    });
  };

  const showWarning = (title: string, message: string) => {
    showModal({
      type: "warning",
      title,
      message,
      buttons: [{ text: "Understood", onPress: hideModal, style: "primary" }],
    });
  };

  const showInfo = (title: string, message: string) => {
    showModal({
      type: "info",
      title,
      message,
      buttons: [{ text: "OK", onPress: hideModal, style: "primary" }],
    });
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    showModal({
      type: "confirm",
      title,
      message,
      buttons: [
        {
          text: "Cancel",
          onPress: () => {
            hideModal();
            if (onCancel) onCancel();
          },
          style: "secondary",
        },
        {
          text: "Confirm",
          onPress: () => {
            hideModal();
            onConfirm();
          },
          style: "primary",
        },
      ],
    });
  };

  const contextValue: ModalContextType = {
    showModal,
    hideModal,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      <UniversalModal
        visible={modalState.visible}
        onClose={hideModal}
        type={modalState.options.type}
        title={modalState.options.title}
        message={modalState.options.message}
        buttons={modalState.options.buttons}
        autoClose={modalState.options.autoClose}
        autoCloseDelay={modalState.options.autoCloseDelay}
      />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
