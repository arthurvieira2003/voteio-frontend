import { makeStyles } from "@mui/styles";

export const useStyles = makeStyles((theme) => ({
  gradientButton: {
    background: "linear-gradient(45deg, #9571f5 30%, #ff6b6b 90%)",
    border: 0,
    borderRadius: 3,
    boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
    color: "white",
    height: 48,
    padding: "0 30px",
    "&:hover": {
      background: "linear-gradient(45deg, #8460e4 30%, #ff5a5a 90%)",
    },
  },
}));
