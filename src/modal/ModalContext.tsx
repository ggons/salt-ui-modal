import React, { useState, useCallback, createContext } from 'react';
import ReactDOM from 'react-dom';

interface IOpenModalProps {
  header?: React.ReactNode;
  body: React.ReactNode;
  overlayClose?: boolean;
  closeButton?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
}

type TModalState = IOpenModalProps & {
  id: string;
  onClose: () => void;
  onConfirm: () => void;
};

export const ModalContext = React.createContext({
  openModal: (props: IOpenModalProps) => {},
});

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modals, setModals] = React.useState<TModalState[]>([]);

  const closeModal = React.useCallback((id: string) => {
    setModals((modalState) => modalState.filter((d) => d.id !== id));
  }, []);

  const openModal = React.useCallback(
    ({
      header,
      body,
      overlayClose = false,
      closeButton = false,
      onOk,
      onCancel,
    }: IOpenModalProps) => {
      return new Promise((resolve) => {
        const id = String(Date.now());

        const onClose = () => {
          onCancel && onCancel();
          closeModal(id);
          resolve(false);
        };

        const onConfirm = () => {
          onOk && onOk();
          closeModal(id);
          resolve(true);
        };

        setModals((prevState) => {
          return [
            ...prevState,
            {
              id,
              header,
              body,
              overlayClose,
              closeButton,
              onOk,
              onConfirm,
              onClose,
              onCancel,
            },
          ];
        });
      });
    },
    [closeModal],
  );

  const handleBackdropClick = (
    e: React.MouseEvent<HTMLDivElement>,
    onClose: () => void,
  ) => {
    if (e.target !== e.currentTarget) {
      return;
    }

    onClose();
  };

  return (
    <ModalContext.Provider value={{ openModal }}>
      {modals.map(
        ({
          id,
          header,
          body,
          overlayClose,
          closeButton,
          onConfirm,
          onClose,
          onCancel,
        }) => {
          const isUseFooter: boolean =
            !!onConfirm || !!closeButton || !!onCancel;

          return (
            <ModalPortal key={id}>
              <div
                className="fixed w-full h-full left-0 top-0 z-50 grid items-center justify-center bg-black bg-opacity-25"
                {...(overlayClose
                  ? { onClick: (e) => handleBackdropClick(e, onClose) }
                  : {})}
              >
                <div className="bg-white rounded-lg border border-gray-500 shadow relative">
                  {closeButton && (
                    <button
                      className="absolute top-1 right-1 rounded-full p-2 hover:bg-gray-100 active:bg-gray-200"
                      onClick={() => onClose()}
                    >
                      X
                    </button>
                  )}

                  {header && (
                    <div className="px-16 h-16 grid items-center justify-center border-b border-gray-500">
                      <h2 className="text-gray-700 text-xl font-medium">
                        {header}
                      </h2>
                    </div>
                  )}

                  <div className="px-16 py-8 text-lg">
                    {typeof body === 'string'
                      ? body
                      : React.cloneElement(body as React.ReactElement, {
                          onConfirm,
                          onClose,
                        })}
                  </div>

                  {isUseFooter && (
                    <div className="p-2 w-full flex justify-center gap-x-1">
                      {onConfirm && (
                        <button
                          className="grow rounded-md text-lg bg-gray-700 text-white hover:bg-gray-800 active:bg-gray-900"
                          onClick={onConfirm}
                        >
                          확인
                        </button>
                      )}
                      {(closeButton || onCancel) && (
                        <button
                          className="grow rounded-md text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                          onClick={onClose}
                        >
                          취소
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </ModalPortal>
          );
        },
      )}
      {children}
    </ModalContext.Provider>
  );
}

function ModalPortal({ children }: { children: React.ReactNode }) {
  return ReactDOM.createPortal(
    children,
    document.getElementById('modal-root') as HTMLDivElement,
  );
}
