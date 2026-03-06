import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, FileText, MapPin, Tag, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../context/auth/useAuth';
import { createJob } from '../../../services/jobs/jobs.service';
import { getErrorMessage } from '../../utils/errors';

const CATEGORIES = [
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Sales',
  'Support',
  'Other',
];

function validateForm(values) {
  const errors = {};

  if (!values.company?.trim()) errors.company = 'Company is required';
  if (!values.title?.trim()) errors.title = 'Title is required';
  if (!values.description?.trim()) errors.description = 'Description is required';
  if (!values.location?.trim()) errors.location = 'Location is required';
  if (!values.category?.trim()) errors.category = 'Category is required';

  const minVal = values.salary_min?.toString().trim();
  const maxVal = values.salary_max?.toString().trim();

  if (minVal) {
    const n = Number(minVal);
    if (Number.isNaN(n) || n < 0) errors.salary_min = 'Must be a non-negative number';
  }
  if (maxVal) {
    const n = Number(maxVal);
    if (Number.isNaN(n) || n < 0) errors.salary_max = 'Must be a non-negative number';
  }
  if (minVal && maxVal) {
    const minN = Number(minVal);
    const maxN = Number(maxVal);
    if (!Number.isNaN(minN) && !Number.isNaN(maxN) && minN > maxN) {
      errors.salary_max = 'Must be greater than or equal to minimum salary';
    }
  }

  return errors;
}

function parseSalary(val) {
  const s = val?.toString().trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isNaN(n) ? null : n;
}

function CreateJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [values, setValues] = useState({
    company: '',
    title: '',
    description: '',
    location: '',
    category: '',
    salary_min: '',
    salary_max: '',
  });

  const handleChange = (field) => (e) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm(values);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    if (!user?.id) {
      toast.error('You must be signed in to post a job.');
      return;
    }

    setSubmitting(true);
    const salary_min = parseSalary(values.salary_min);
    const salary_max = parseSalary(values.salary_max);
    const payload = {
      employer_id: user.id,
      company: values.company.trim(),
      title: values.title.trim(),
      description: values.description.trim(),
      location: values.location.trim(),
      category: values.category.trim(),
      salary_min: salary_min ?? null,
      salary_max: salary_max ?? null,
    };

    const { data, error } = await createJob(payload);
    setSubmitting(false);

    if (error) {
      toast.error(getErrorMessage(error));
      return;
    }

    toast.success('Job created');
    if (data?.id) {
      navigate(`/jobs/${data.id}`, { replace: true });
    } else {
      navigate('/jobs/my-jobs', { replace: true });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
          Post a job
        </h1>
        <p className="mt-1 text-slate-600">
          Fill in the details below to create a new job listing.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Card.Content className="space-y-5">
            <Input
              label="Company"
              name="company"
              required
              placeholder="Dugsiiye"
              value={values.company}
              onChange={handleChange('company')}
              error={errors.company}
              leftIcon={Building2}
              autoComplete="organization"
            />
            <Input
              label="Job title"
              name="title"
              required
              placeholder="Senior Software Engineer"
              value={values.title}
              onChange={handleChange('title')}
              error={errors.title}
              leftIcon={FileText}
            />
            <div className="w-full">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={5}
                placeholder="Describe the role, responsibilities, and requirements..."
                value={values.description}
                onChange={handleChange('description')}
                className={`
                  w-full rounded-lg border bg-white px-3 py-2.5
                  placeholder:text-slate-400 text-slate-900
                  focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 focus:border-transparent
                  transition-shadow duration-150 resize-y min-h-[120px]
                  ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 hover:border-slate-300'}
                `}
                aria-invalid={!!errors.description}
              />
              {errors.description && (
                <p className="mt-1.5 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
            <Input
              label="Location"
              name="location"
              required
              placeholder="Remote or City, Country"
              value={values.location}
              onChange={handleChange('location')}
              error={errors.location}
              leftIcon={MapPin}
            />
            <div className="w-full">
              <label
                htmlFor="category"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                required
                value={values.category}
                onChange={handleChange('category')}
                className={`
                  w-full h-11 rounded-lg border bg-white px-3
                  focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 focus:border-transparent
                  transition-shadow duration-150
                  ${errors.category ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 hover:border-slate-300'}
                `}
                aria-invalid={!!errors.category}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1.5 text-sm text-red-600">{errors.category}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Minimum salary (optional)"
                name="salary_min"
                type="text"
                inputMode="numeric"
                placeholder="e.g. 50000"
                value={values.salary_min}
                onChange={handleChange('salary_min')}
                error={errors.salary_min}
                leftIcon={DollarSign}
              />
              <Input
                label="Maximum salary (optional)"
                name="salary_max"
                type="text"
                inputMode="numeric"
                placeholder="e.g. 80000"
                value={values.salary_max}
                onChange={handleChange('salary_max')}
                error={errors.salary_max}
                leftIcon={DollarSign}
              />
            </div>
          </Card.Content>
          <Card.Footer className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              loading={submitting}
              className="w-full sm:w-auto"
            >
              Post job
            </Button>
          </Card.Footer>
        </form>
      </Card>
    </div>
  );
}

export default CreateJob;
