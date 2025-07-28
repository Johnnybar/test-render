import { useContext, useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { Link } from "react-router-dom";
import {
  MapOutlined,
  TableChartOutlined,
  Home,
  Search,
  DateRange,
  LocationOn,
} from "@mui/icons-material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { EventFinderContext } from "./context/context";
import { eventsInfoMock } from "./mocks";

export const Dashboard = () => {
  const { eventsInfo, setEventsInfo } = useContext(EventFinderContext);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredRows, setFilteredRows] = useState<any[]>([]);

  useEffect(() => {
    if (!eventsInfo.length) {
      setEventsInfo(eventsInfoMock);
    }
    setLoading(false);
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
      width: 80,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "kurztitel",
      headerName: "Event Name",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Typography
          variant="body2"
          fontWeight="medium"
          sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "va_name",
      headerName: "Description",
      flex: 1.5,
      minWidth: 250,
    },
    {
      field: "ort",
      headerName: "Location",
      width: 120,
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
    {
      field: "datum_ende",
      headerName: "End Date",
      width: 120,
      valueFormatter: formatDate,
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
            <Button
              component={Link}
              to="/dashboard"
              color="inherit"
              variant="outlined"
              startIcon={<TableChartOutlined />}
            >
              Table View
            </Button>
            <Button
              component={Link}
              to="/map"
              color="inherit"
              startIcon={<MapOutlined />}
            >
              Map View
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          height: "calc(100% - 64px)",
        }}
      >
        <Paper
          elevation={0}
          sx={{ mb: 3, p: 2, bgcolor: "background.default" }}
        >
          <Typography
            variant="h5"
            component="h1"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            Events Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Browse all available events in Berlin. Use the search box to filter
            events.
          </Typography>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search events by name, description or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2, mt: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              {filteredRows.length} events found
            </Typography>
          </Box>
        </Paper>

        <Paper
          elevation={2}
          sx={{
            flexGrow: 1,
            height: "100%",
            overflow: "hidden",
            borderRadius: 2,
            "& .MuiDataGrid-root": {
              border: "none",
              "& .MuiDataGrid-cell:focus-within": {
                outline: "none",
              },
            },
          }}
        >
          {loading ? (
            <Backdrop open={loading} sx={{ position: "absolute", zIndex: 1 }}>
              <CircularProgress color="inherit" />
            </Backdrop>
          ) : (
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
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
              autoHeight={false}
              sx={{
                height: "100%",
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.04)",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "rgba(25, 118, 210, 0.08)",
                  color: "text.primary",
                  fontWeight: "bold",
                },
              }}
            />
          )}
        </Paper>
      </Box>
    </Container>
  );
};
