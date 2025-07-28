import { useContext, useEffect, useState } from "react";
import {
  Box,
  Dialog,
  Typography,
  Container,
  Paper,
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Card,
  CardContent,
  Chip,
  Backdrop,
  CircularProgress,
  TextField,
  InputAdornment,
  useMediaQuery,
  useTheme,
  Tooltip,
} from "@mui/material";
import { Link } from "react-router-dom";
import {
  Home,
  Close,
  Search,
  DateRange,
  LocationOn,
} from "@mui/icons-material";

import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { EventFinderContext, EventsInfo } from "./context/context";
import { eventsInfoMock } from "./mocks";

export const CombinedView = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { eventsInfo, setEventsInfo } = useContext(EventFinderContext);
  const [eventOpen, setEventOpen] = useState<{
    id: number | null;
    open: boolean;
  }>({ id: null, open: false });
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredRows, setFilteredRows] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [viewState, setViewState] = useState({
    latitude: 52.52,
    longitude: 13.405,
    zoom: 10,
  });

  const geocodeAddress = async (
    address: string
  ): Promise<{ latitude: number; longitude: number }> => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          address
        )}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`
      );

      if (!response.ok) {
        throw new Error(`Geocoding error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.features || data.features.length === 0) {
        throw new Error("No location found for this address");
      }

      const [longitude, latitude] = data.features[0].center;
      return { latitude, longitude };
    } catch (error) {
      console.error("Geocoding failed:", error);
      return { latitude: 52.52, longitude: 13.405 };
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/berlin-courses");

        if (!response.ok) {
          setEventsInfo(eventsInfoMock);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const text = await response.text();
        const data = JSON.parse(text);

        const filteredData = data.index
          .filter((course: any) => {
            const datumBeginn = new Date(course.datum_beginn);
            const datumEnde = new Date(course.datum_ende);
            const filterStartDate = new Date();
            const filterEndDate = new Date();
            filterEndDate.setFullYear(filterStartDate.getFullYear() + 1);

            return (
              datumBeginn >= filterStartDate &&
              datumEnde <= filterEndDate &&
              course.ort === "Berlin" &&
              course.va_adresse.includes("Berlin")
            );
          })
          .map((course: any) => ({
            ...course,
            va_adresse: course.va_adresse.replace(/\n/g, " "),
          }));

        const geocodingPromises = filteredData.map(async (course: any) => {
          try {
            const coords = await geocodeAddress(course.va_adresse);
            return {
              id: course.id,
              latitude: coords.latitude,
              longitude: coords.longitude,
              eventInfo: course,
            } as EventsInfo;
          } catch (error) {
            console.error(`Error geocoding ${course.va_adresse}:`, error);
            return null;
          }
        });

        const geocodedEvents = (await Promise.all(geocodingPromises)).filter(
          Boolean
        ) as EventsInfo[];
        setEventsInfo(geocodedEvents);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setEventsInfo(eventsInfoMock);
      } finally {
        setLoading(false);
      }
    };

    if (!eventsInfo.length) {
      fetchEvents();
    } else {
      setLoading(false);
    }
  }, [eventsInfo.length, setEventsInfo]);

  useEffect(() => {
    if (Array.isArray(eventsInfo) && eventsInfo.length > 0) {
      const adjustedRows = eventsInfo
        .map((event) => event.eventInfo)
        .filter(
          (event) =>
            event.kurztitel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.va_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.ort?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      setFilteredRows(adjustedRows);
    }
  }, [eventsInfo, searchTerm]);

  const handleOpenEvent = (id: number | null) => {
    setEventOpen({ id, open: true });
  };

  const handleCloseEvent = () => {
    setEventOpen({ id: null, open: false });
  };

  const handleRowClick = (params: any) => {
    const eventId = params.row.id;
    setSelectedEventId(eventId);

    // Find the event and center the map on it
    const event = eventsInfo.find((e) => e.id === eventId);
    if (event) {
      setViewState({
        latitude: event.latitude,
        longitude: event.longitude,
        zoom: 14,
      });
    }
  };

  const formatDate = (params: GridRenderCellParams) => {
    if (!params.value) return "";
    return new Date(params.value).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 90,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Tooltip title={params.value} arrow leaveDelay={400}>
          <Typography
            variant="body2"
            fontWeight="medium"
            sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
          >
            {params.value}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: "kurztitel",
      headerName: "Event Name",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Tooltip title={params.value} arrow>
          <Typography
            variant="body2"
            fontWeight="medium"
            sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
          >
            {params.value}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: "ort",
      headerName: "Location",
      width: 100,
      renderCell: (params) => (
        <Chip
          size="small"
          icon={<LocationOn fontSize="small" />}
          label={params.value}
          variant="outlined"
          color="primary"
        />
      ),
    },
    {
      field: "datum_beginn",
      headerName: "Start Date",
      width: 120,
      valueFormatter: formatDate,
      renderCell: (params) => (
        <Chip
          size="small"
          icon={<DateRange fontSize="small" />}
          label={formatDate(params)}
          variant="outlined"
        />
      ),
    },
  ];

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{ height: "100vh", display: "flex", flexDirection: "column" }}
    >
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 600 }}
          >
            Berlin Events Finder
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              component={Link}
              to="/"
              color="inherit"
              startIcon={<Home />}
            >
              Home
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {loading ? (
        <Backdrop open={loading} sx={{ color: "#fff", zIndex: 9999 }}>
          <CircularProgress color="inherit" />
        </Backdrop>
      ) : (
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          {/* Table Section */}
          <Box
            sx={{
              width: isMobile ? "100%" : "50%",
              display: "flex",
              flexDirection: "column",
              borderRight: isMobile ? "none" : "1px solid #e0e0e0",
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: "background.default",
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <Typography
                variant="h6"
                component="h2"
                gutterBottom
                sx={{ fontWeight: "bold" }}
              >
                Events Table
              </Typography>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {filteredRows.length} events found • Click a row to center map
              </Typography>
            </Paper>

            <Box sx={{ flexGrow: 1, height: isMobile ? "300px" : "auto" }}>
              <DataGrid
                rows={filteredRows || []}
                columns={columns}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10, page: 0 },
                  },
                  sorting: {
                    sortModel: [{ field: "datum_beginn", sort: "asc" }],
                  },
                }}
                pageSizeOptions={[10, 25, 50]}
                disableRowSelectionOnClick={false}
                onRowClick={handleRowClick}
                getRowClassName={(params) =>
                  params.row.id === selectedEventId ? "selected-row" : ""
                }
                sx={{
                  border: "none",
                  "& .MuiDataGrid-cell:focus-within": {
                    outline: "none",
                  },
                  "& .MuiDataGrid-row:hover": {
                    backgroundColor: "rgba(25, 118, 210, 0.04)",
                    cursor: "pointer",
                  },
                  "& .selected-row": {
                    backgroundColor: "rgba(25, 118, 210, 0.12) !important",
                  },
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                    color: "text.primary",
                    fontWeight: "bold",
                  },
                }}
              />
            </Box>
          </Box>

          {/* Map Section */}
          <Box
            sx={{
              width: isMobile ? "100%" : "50%",
              position: "relative",
              height: isMobile ? "50vh" : "auto",
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: "background.default",
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <Typography
                variant="h6"
                component="h2"
                sx={{ fontWeight: "bold" }}
              >
                Interactive Map
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Click markers to view event details
              </Typography>
            </Paper>

            <Box sx={{ height: "calc(100% - 80px)" }}>
         
            </Box>
          </Box>
        </Box>
      )}

      {/* Event Details Dialog */}
      {eventOpen.id !== null &&
        eventsInfo.find((event) => event.id === eventOpen.id) && (
          <Dialog
            open={eventOpen.open}
            onClose={handleCloseEvent}
            maxWidth="sm"
            fullWidth
          >
            {eventsInfo.map((event) => {
              if (event.id === eventOpen.id) {
                return (
                  <Card key={event.id} elevation={0}>
                    <CardContent sx={{ p: 0 }}>
                      <Box
                        sx={{
                          p: 2,
                          pb: 1,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="h5"
                          component="h2"
                          fontWeight="bold"
                        >
                          {event.eventInfo.kurztitel}
                        </Typography>
                        <IconButton onClick={handleCloseEvent} size="small">
                          <Close />
                        </IconButton>
                      </Box>

                      <Box sx={{ px: 2, pb: 1 }}>
                        <Typography variant="subtitle1" color="text.secondary">
                          {event.eventInfo.va_name}
                        </Typography>
                      </Box>

                      <Box sx={{ px: 2, pb: 2 }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <Box>
                            <Paper
                              variant="outlined"
                              sx={{ p: 2, bgcolor: "background.default" }}
                            >
                              <Typography
                                variant="body2"
                                component="p"
                                fontWeight="medium"
                              >
                                <strong>Address:</strong>{" "}
                                {event.eventInfo.va_adresse}
                              </Typography>
                            </Paper>
                          </Box>
                          <Box sx={{ display: "flex", gap: 2 }}>
                            <Chip
                              label={`Start: ${new Date(event.eventInfo.datum_beginn).toLocaleDateString("de-DE")}`}
                              color="primary"
                              variant="outlined"
                              size="small"
                              sx={{ flex: 1 }}
                            />
                            <Chip
                              label={`End: ${new Date(event.eventInfo.datum_ende).toLocaleDateString("de-DE")}`}
                              color="secondary"
                              variant="outlined"
                              size="small"
                              sx={{ flex: 1 }}
                            />
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                );
              }
              return null;
            })}
          </Dialog>
        )}
    </Container>
  );
};
