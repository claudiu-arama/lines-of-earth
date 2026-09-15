import styles from "./CityLabel.module.scss";
type StyleVariant = "fade" | "solid";

interface CityLabelProps {
  cityName?: string;
  country?: string;
  message?: string;
  bgColor?: string;
  accentColor?: string;
  fontColor?: string;
  variant?: StyleVariant;
}

type CSSVariable = React.CSSProperties & {
  "--label-bg": string;
  "--label-accent": string;
  "--label-color": string;
};

const STYLES: Record<StyleVariant, React.CSSProperties> = {
  fade: {
    background:
      "linear-gradient(to bottom, transparent 0%, var(--label-bg) 45%)"
  },
  solid: {
    background: "var(--label-bg)",
    borderTop: "2px solid var(--label-accent)"
  }
};

export const CityLabel = ({
  cityName = "London",
  country = "United Kingdom",
  message = "",
  variant = "fade",
  bgColor = "#f5f0e8",
  accentColor = "#1a1a1a",
  fontColor = "#1a1a1a"
}: CityLabelProps) => {
  return (
    <div
      className={styles.cityLabel}
      style={
        {
          "--label-bg": bgColor,
          "--label-accent": accentColor,
          "--label-color": fontColor,
          ...STYLES[variant]
        } as CSSVariable
      }
    >
      <div className={styles.inner}>
        <h1 className={styles.city}>{cityName}</h1>
        <p className={styles.country}>{country}</p>
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
};
