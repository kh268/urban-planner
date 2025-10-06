def apply_rules(row):
    if row["NDVI_mean"] < 0.45 and row["population"] > 100000:
        return " Plant trees / add green roofs"
    elif row["LST_mean"] > 29 and row["NDVI_mean"] < 0.5:
        return " Install cool roofs / reflective pavements"
    elif row["AOD_mean"] > 0.23:
        return " Reduce traffic / monitor air pollution"
    else:
        return " Stable environment"
