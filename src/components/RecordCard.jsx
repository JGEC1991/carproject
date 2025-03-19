import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const RecordCard = ({ record, fields, title, onSave, onCancel, onEdit, onDelete, viewMode = 'view', imageField = null }) => {
  const [mode, setMode] = useState(viewMode);
  const [formData, setFormData] = useState({ ...record });
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeImageUrl, setActiveImageUrl] = useState('');
  const { t } = useTranslation(['translation', 'app']);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setMode('view');
  };

  const handleEdit = () => {
    setMode('edit');
    setFormData({ ...record });
  };

  const handleCancel = () => {
    setMode('view');
    setFormData({ ...record });
    if (onCancel) onCancel();
  };

  const handleDelete = () => {
    if (window.confirm(t('confirmDelete', { ns: 'app' }) + "\n" + t('thisActionCannot', { ns: 'app' }))) {
      onDelete(record.id);
    }
  };

  const handleImageClick = (imageUrl) => {
    setActiveImageUrl(imageUrl);
    setShowImageModal(true);
  };

  const renderImageModal = () => {
    if (!showImageModal) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={() => setShowImageModal(false)}>
        <div className="relative max-w-4xl max-h-screen p-2" onClick={(e) => e.stopPropagation()}>
          <button 
            className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 text-gray-700 hover:text-gray-900"
            onClick={() => setShowImageModal(false)}
          >
            <span className="material-icons">close</span>
          </button>
          <img 
            src={activeImageUrl} 
            alt="Enlarged view" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-xl"
          />
        </div>
      </div>
    );
  };

  const renderField = (field) => {
    const value = formData[field.key];
    
    // Image display special handling
    if (imageField && field.key === imageField) {
      return (
        <div key={field.key} className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            {field.label}
          </label>
          {mode === 'edit' ? (
            <div>
              <input
                type="text"
                name={field.key}
                value={value || ''}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder={field.label}
              />
              {value && (
                <div className="mt-2">
                  <img
                    src={value}
                    alt={field.label}
                    className="h-32 w-auto object-cover rounded cursor-pointer hover:opacity-90"
                    onClick={() => handleImageClick(value)}
                  />
                </div>
              )}
            </div>
          ) : (
            <div>
              {value ? (
                <img
                  src={value}
                  alt={field.label}
                  className="h-48 w-auto object-cover rounded cursor-pointer hover:opacity-90 transition-all"
                  onClick={() => handleImageClick(value)}
                />
              ) : (
                <div className="text-gray-500 italic">{t('noImage', { ns: 'translation', defaultValue: 'No image' })}</div>
              )}
            </div>
          )}
        </div>
      );
    }

    // Standard field rendering
    if (mode === 'edit') {
      return (
        <div key={field.key} className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            {field.label}
          </label>
          {field.type === 'textarea' ? (
            <textarea
              name={field.key}
              value={value || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
              placeholder={field.label}
            />
          ) : field.type === 'select' ? (
            <select
              name={field.key}
              value={value || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Select...</option>
              {field.options && field.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : field.type === 'checkbox' ? (
            <input
              type="checkbox"
              name={field.key}
              checked={!!value}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
          ) : (
            <input
              type={field.type || 'text'}
              name={field.key}
              value={value || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder={field.label}
            />
          )}
        </div>
      );
    }

    // View mode
    return (
      <div key={field.key} className="mb-4">
        <h3 className="text-gray-600 text-sm font-medium">{field.label}</h3>
        <div className="mt-1">
          {field.type === 'checkbox' ? (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {value ? t('yes', { ns: 'translation', defaultValue: 'Yes' }) : t('no', { ns: 'translation', defaultValue: 'No' })}
            </span>
          ) : (
            <p className="text-gray-900">{value || <span className="text-gray-400 italic">{t('notProvided', { ns: 'translation', defaultValue: 'Not provided' })}</span>}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 transition-all hover:shadow-xl">
        <div className="p-5 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            <div className="flex space-x-2">
              {mode === 'view' ? (
                <>
                  <button
                    onClick={handleEdit}
                    className="inline-flex items-center text-sm px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    <span className="material-icons text-sm mr-1">edit</span>
                    {t('edit', { ns: 'app' })}
                  </button>
                  {onDelete && (
                    <button
                      onClick={handleDelete}
                      className="inline-flex items-center text-sm px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                    >
                      <span className="material-icons text-sm mr-1">delete</span>
                      {t('delete', { ns: 'app' })}
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={handleSubmit}
                    className="inline-flex items-center text-sm px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                  >
                    <span className="material-icons text-sm mr-1">save</span>
                    {t('save', { ns: 'app' })}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <span className="material-icons text-sm mr-1">cancel</span>
                    {t('cancel', { ns: 'app' })}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fields.map(field => renderField(field))}
            </div>
          </form>
        </div>
      </div>

      {renderImageModal()}
    </>
  );
};

export default RecordCard;
