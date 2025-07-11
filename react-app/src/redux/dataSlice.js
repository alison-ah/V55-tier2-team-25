//latest slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const RESOURCES_URL = 'https://seshatbe.up.railway.app/resources';
const TAGS_URL = 'https://seshatbe.up.railway.app/tags';

// const RESOURCES_URL = '/resources.json';
// const TAGS_URL = '/tags.json';

export const fetchTags = createAsyncThunk(
  'data/fetchTags',
  async (_, { rejectWithValue }) => {
    try {
      const tagsResponse = await fetch(TAGS_URL);
      if (!tagsResponse.ok) {
        throw new Error(`HTTP error! status: ${tagsResponse.status} for tags`);
      }
      const tagList = await tagsResponse.json();
      const uniqueTags = [...new Set(tagList)];
      return uniqueTags;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchData = createAsyncThunk(
  'data/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const resourcesResponse = await fetch(RESOURCES_URL);
      if (!resourcesResponse.ok) {
        throw new Error(`HTTP error! status: ${resourcesResponse.status} for resources`);
      }

      const resources = await resourcesResponse.json();
      const uniqueResources = [
        ...new Map(resources.map((item) => [item.id, item])).values(),
      ];
      const sortedResources = [...uniqueResources].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      const mostRecent = sortedResources.slice(0, 5);

      return {
        resources: uniqueResources, // Store all unique resources
        mostRecent: mostRecent,
         };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const dataSlice = createSlice({
  name: 'data',
  initialState: {
    resources: [],
    tags: [],
    mostRecent: [],
    loading: false,
    //adding this
    isLatestLoaded: false,
    error: null,
    searchTerm: '',
    selectedTags: [],
    searchResults: [],
    isMobile: false,
  },
  reducers: {
    //search term reducer
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.loading = false;
      state.searchResults = state.resources.filter(item =>
        JSON.stringify(item).toLowerCase().includes(action.payload.toLowerCase())
      );
    },
    setSelectedTags: (state, action) => {
      state.selectedTags = action.payload;
      state.loading = false;
      state.searchResults = state.resources.filter(item =>
        JSON.stringify(item).toLowerCase().includes(action.payload.toLowerCase())
      );
    },
    setIsMobile: (state, action) => {
      state.isMobile = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Handle the pending, fulfilled, and rejected states of the fetchData thunk
    builder

     .addCase(fetchTags.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchTags.fulfilled, (state, action) => {
      state.loading = false;
      state.tags = action.payload;
    })
    .addCase(fetchTags.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })

      .addCase(fetchData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.isLatestLoaded = true;
        state.loading = false;
        state.resources = action.payload.resources;
        state.mostRecent = action.payload.mostRecent;
        // state.tags = action.payload.tags;
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSearchTerm, setIsMobile } = dataSlice.actions;

// Selectors
export const selectResources = (state) => state.data.resources;
export const selectTags = (state) => state.data.tags;
export const selectMostRecent = (state) => state.data.mostRecent;
export const selectLoading = (state) => state.data.loading;
export const selectError = (state) => state.data.error;
export const selectSearchTerm = (state) => state.data.searchTerm;
export const selectSearchResults = (state) => state.data.searchResults;
export const selectIsMobile = (state) => state.data.isMobile;


export default dataSlice.reducer;