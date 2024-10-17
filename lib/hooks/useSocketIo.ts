import { SocketContext } from "@components/SocketIoProvider";
import { useContext } from "react";

const useSocketIo = () => {
  const socket = useContext(SocketContext);

  return socket;
};

export default useSocketIo;
