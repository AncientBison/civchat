export function LoadingTripleDots() {
  return (
    <svg height="10" width="50">
      <circle cx="5" cy="5" fill={"white"} r="5">
        <animate
          attributeName="opacity"
          begin="0s"
          calcMode="linear"
          dur="1"
          keyTimes="0;0.2;1"
          repeatCount="indefinite"
          values="0;1;1"
        />
      </circle>
      <circle cx="25" cy="5" fill={"white"} r="5">
        <animate
          attributeName="opacity"
          begin="0s"
          calcMode="linear"
          dur="1"
          keyTimes="0;0.2;0.4;1"
          repeatCount="indefinite"
          values="0;0;1;1"
        />
      </circle>
      <circle cx="45" cy="5" fill={"white"} r="5">
        <animate
          attributeName="opacity"
          begin="0s"
          calcMode="linear"
          dur="1"
          keyTimes="0;0.4;0.6;1"
          repeatCount="indefinite"
          values="0;0;1;1"
        />
      </circle>
    </svg>
  );
}
