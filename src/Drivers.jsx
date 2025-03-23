import { useState, useEffect } from 'react';
import { supabase from '../supabaseClient';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  IconButton,
  Tooltip,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button
} from "@material-tailwind/react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";
import Popout from '../components/Popout';
import DriverRecordCard from '../components/DriverRecordCard';

const Drivers = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showViewForm, setShowViewForm] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [newDriver, setNewDriver] = useState({
    name: '',
    license_number: '',
    phone: '',
    email: '',
    photo_url: '',
    license_image_url: '',
    criminal_records_url: '',
    police_records_url: '',
    national_id_url: '',
    home_address: '',
  });
  const [uploading, setUploading] = useState(false);

  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const driversPerPage = 5;

  const columns = [
    { key: 'name', title: 'Name', sortable: true },
    { key: 'license_number', title: 'License Number', sortable: true },
    { key: 'phone', title: 'Phone', sortable: true },
    { key: 'email', title: 'Email', sortable: true },
  ];

  useEffect(() => {
    const fetchDrivers = async () => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('drivers')
          .select('*');

        if (sortBy) {
          query = query.order(sortBy, { ascending: sortDirection === 'asc' });
        }

        const { data, error } = await query;

        if (error) {
          setError(error.message);
          return;
        }

        setDrivers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, [sortBy, sortDirection]);

  useEffect(() => {
    if (selectedDriver) {
      setNewDriver({
        name: selectedDriver.name || '',
        license_number: selectedDriver.license_number || '',
        phone: selectedDriver.phone || '',
        email: selectedDriver.email || '',
        photo_url: selectedDriver.photo_url || '',
        license_image_url: selectedDriver.license_image_url || '',
        criminal_records_url: selectedDriver.criminal_records_url || '',
        police_records_url: selectedDriver.police_records_url || '',
        national_id_url: selectedDriver.national_id_url || '',
        home_address: selectedDriver.home_address || '',
      });
    }
  }, [selectedDriver]);

  const handleAddDriverClick = () => {
    setShowAddForm(true);
    setSelectedDriver(null);
    setNewDriver({
      name: '',
      license_number: '',
      phone: '',
      email: '',
      photo_url: '',
      license_image_url: '',
      criminal_records_url: '',
      police_records_url: '',
      national_id_url: '',
      home_address: '',
    });
  };

  const handleCloseAddForm = () => {
    setShowAddForm(false);
    setSelectedDriver(null);
  };

  const handleCloseViewForm = () => {
    setShowViewForm(false);
    setSelectedDriver(null);
  };

  const handleInputChange = (e) => {
    setNewDriver({ ...newDriver, [e.target.id]: e.target.value });
  };

  const handleImageUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedDriver.id}-${fieldName}.${fileExt}`;
      const filePath = `drivers/${selectedDriver.name}/${fieldName}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('jerentcars-storage')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('jerentcars-storage')
        .getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl;

      setNewDriver({ ...newDriver, [fieldName]: publicUrl });

    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddDriverSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get the user's organization ID
      const { data: authUser, error: authError } = await supabase.auth.getUser();

      if (authError) {
        setError(authError.message);
        return;
      }

      const userId = authUser.user.id;

      const { data: userData, error: orgError } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userId)
        .single();

      if (orgError) {
        setError(orgError.message);
        return;
      }

      const organizationId = userData?.organization_id;

      if (!organizationId) {
        setError('Unable to determine organization ID.');
        return;
      }

      // Include the organization_id and user_id in the new driver data
      const newDriverWithOrg = {
        ...newDriver,
        organization_id: organizationId,
      };

      let data, error;

      if (selectedDriver) {
        // Update existing driver
        ({ data, error } = await supabase
          .from('drivers')
          .update(newDriverWithOrg)
          .eq('id', selectedDriver.id)
          .select());
      } else {
        // Insert new driver
        ({ data, error } = await supabase
          .from('drivers')
          .insert([newDriverWithOrg])
          .select());
      }

      if (error) {
        setError(error.message);
        return;
      }

      setDrivers([...drivers.filter(d => d.id !== data[0].id), ...data]); // Update or Add the new driver to the list
      setNewDriver({ // Reset the form
        name: '',
        license_number: '',
        phone: '',
        email: '',
        photo_url: '',
        license_image_url: '',
        criminal_records_url: '',
        police_records_url: '',
        national_id_url: '',
        home_address: '',
      });
      setShowAddForm(false); // Hide the form
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDriver = (driver) => {
    setSelectedDriver(driver);
    setShowViewForm(true);
    setShowAddForm(false);
  };

  const handleEditDriver = (driver) => {
    setSelectedDriver(driver);
    setShowAddForm(true);
    setShowViewForm(false);
  };

  const handleDeleteDriver = async (driver) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      setLoading(true);
      setError(null);

      try {
        const { error } = await supabase
          .from('drivers')
          .delete()
          .eq('id', driver.id);

        if (error) {
          setError(error.message);
          return;
        }

        setDrivers(drivers.filter((d) => d.id !== driver.id)); // Remove the driver from the list
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnKey);
      setSortDirection('asc');
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to the first page when searching
  };

  const filteredDrivers = drivers.filter(driver => {
    const searchRegex = new RegExp(searchTerm, 'i');
    return (
      searchRegex.test(driver.name) ||
      searchRegex.test(driver.license_number) ||
      searchRegex.test(driver.phone) ||
      searchRegex.test(driver.email)
    );
  });

  const totalPages = Math.ceil(filteredDrivers.length / driversPerPage);
  const startIndex = (currentPage - 1) * driversPerPage;
  const endIndex = startIndex + driversPerPage;
  const currentDrivers = filteredDrivers.slice(startIndex, endIndex);

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div>
              <Typography variant="h5" color="blue-gray">
                Drivers
              </Typography>
            </div>
            <div className="flex w-full shrink-0 gap-2 md:w-max">
              <div className="w-full md:w-72">
                <Input label="Search" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607m0 0v3.367a2.25 2.25 0 01-2.25 2.25H5.196" /></svg>} value={searchTerm} onChange={handleSearchChange} />
              </div>
              <Button color="green" onClick={handleAddDriverClick}>
                Add New Driver
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <Table className="min-w-full">
            <Thead>
              <Tr>
                {columns.map((column) => (
                  <Th key={column.key} className="p-4 border-b border-blue-gray-50">
                    <div className="flex items-center gap-2">
                      {column.title}
                      {column.sortable && (
                        <IconButton size="sm" variant="text" color="blue-gray" onClick={() => handleSort(column.key)}>
                          {sortBy === column.key && sortDirection === 'asc' ? <ArrowDownIcon strokeWidth={3} className="h-4 w-4" /> : <ArrowUpIcon strokeWidth={3} className="h-4 w-4" />}
                        </IconButton>
                      )}
                    </div>
                  </Th>
                ))}
                <Th className="p-4 border-b border-blue-gray-50">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentDrivers.map((driver) => (
                <Tr key={driver.id} className="hover:bg-gray-100">
                  {columns.map((column) => (
                    <Td key={`${driver.id}-${column.key}`} className="p-4 border-b border-blue-gray-50">
                      {driver[column.key] || '-'}
                    </Td>
                  ))}
                  <Td className="p-4 border-b border-blue-gray-50">
                    <div className="flex justify-end gap-2">
                      <Tooltip content="View Driver">
                        <IconButton variant="text" color="blue" onClick={() => handleViewDriver(driver)}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.225 1.225 0 01.757-.77m0 0a6.218 6.218 0 013.595-3.029m0 0a6.248 6.248 0 012.103-.66c1.13.069 2.231.402 3.31.968a10.309 10.309 0 015.49-2.637c.527 1.054.932 2.274.996 3.64a10.327 10.327 0 01-3.992 5.905m0 0a1.225 1.225 0 011.106.757m0 0a6.248 6.248 0 012.104.66c1.13-.068 2.23-.401 3.31-.968a10.269 10.269 0 01-5.49 2.637c-.527-1.054-.932-2.274-.996-3.64a10.307 10.307 0 013.992-5.905" />
                          </svg>
                        </IconButton>
                      </Tooltip>
                      <Tooltip content="Edit Driver">
                        <IconButton variant="text" color="green" onClick={() => handleEditDriver(vehicle)}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v5.638a1.125 1.125 0 01-1.125 1.125H5.125a1.125 1.125 0 01-1.125-1.125V12.5" />
                          </svg>
                        </IconButton>
                      </Tooltip>
                      <Tooltip content="Delete Driver">
                        <IconButton variant="text" color="red" onClick={() => handleDeleteDriver(vehicle)}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 11.182l-2-2m0 0l-2 2m2-2l2 2m-2-2H14.5V14M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </IconButton>
                      </Tooltip>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
        <div className="flex items-center justify-between p-4">
          <Typography variant="small" color="blue-gray" className="font-normal">
            Page {currentPage} of {totalPages}
          </Typography>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outlined"
              color="blue-gray"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outlined"
              color="blue-gray"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      <Popout isOpen={showAddForm} onClose={handleCloseAddForm}>
        {/* Add/Edit Vehicle Form */}
      </Popout>

      <Popout isOpen={showViewForm} onClose={handleCloseViewForm}>
        {selectedVehicle && (
          <RevenueRecordCard revenue={selectedVehicle} />
        )}
      </Popout>
    </div>
  );
};

export default Drivers
