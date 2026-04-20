import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const usePaymentSocket = ({ token, enabled = true, onPaymentUpdate, onFinancePaymentUpdate }) => {
  const paymentUpdateRef = useRef(onPaymentUpdate);
  const financeUpdateRef = useRef(onFinancePaymentUpdate);

  useEffect(() => {
    paymentUpdateRef.current = onPaymentUpdate;
    financeUpdateRef.current = onFinancePaymentUpdate;
  }, [onPaymentUpdate, onFinancePaymentUpdate]);

  useEffect(() => {
    if (!enabled || !token) {
      return undefined;
    }

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      auth: {
        token
      }
    });

    socket.on("payment:updated", (payload) => {
      paymentUpdateRef.current?.(payload);
    });

    socket.on("finance:payment-updated", (payload) => {
      financeUpdateRef.current?.(payload);
    });

    return () => {
      socket.disconnect();
    };
  }, [enabled, token]);
};
