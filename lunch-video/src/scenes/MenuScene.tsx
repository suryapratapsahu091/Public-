import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { body, display } from "../fonts";

const MenuItem: React.FC<{
  name: string;
  detail: string;
  price: string;
  color: string;
}> = ({ name, detail, price, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Interactive.Div
      name="Menu item"
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 48,
        width: 1400,
        paddingTop: 36,
        paddingBottom: 36,
        borderBottom: "3px dashed #D9C3A5",
        opacity: interpolate(frame, [0, 0.4 * fps], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(
          frame,
          [0, 0.7 * fps],
          ["-120px 0px", "0px 0px"],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          },
        ),
      }}
    >
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
      <div
        style={{ display: "flex", flexDirection: "column", flex: 1, gap: 6 }}
      >
        <div
          style={{
            fontFamily: display,
            fontWeight: 600,
            fontSize: 76,
            color: "#2B1D14",
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: body,
            fontWeight: 400,
            fontSize: 40,
            color: "#7A6553",
          }}
        >
          {detail}
        </div>
      </div>
      <div
        style={{
          fontFamily: body,
          fontWeight: 600,
          fontSize: 64,
          color: "#E4572E",
        }}
      >
        {price}
      </div>
    </Interactive.Div>
  );
};

export const MenuScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Menu scene"
      style={{
        backgroundColor: "#FFF4E3",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Interactive.Div
        name="Menu title"
        style={{
          fontFamily: display,
          fontWeight: 800,
          fontSize: 120,
          color: "#2B1D14",
          marginBottom: 24,
          width: 1400,
          opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        On the menu today
      </Interactive.Div>
      <Sequence name="Soup" from={0.5 * fps} layout="none">
        <MenuItem
          name="Tomato basil soup"
          detail="Slow-roasted tomatoes, sourdough croutons"
          price="$6"
          color="#E4572E"
        />
      </Sequence>
      <Sequence name="Wrap" from={1.1 * fps} layout="none">
        <MenuItem
          name="Grilled chicken wrap"
          detail="Charred peppers, garlic yoghurt, greens"
          price="$9"
          color="#76B041"
        />
      </Sequence>
      <Sequence name="Tart" from={1.7 * fps} layout="none">
        <MenuItem
          name="Lemon tart"
          detail="Buttery crust, whipped cream"
          price="$4"
          color="#F3B61F"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
