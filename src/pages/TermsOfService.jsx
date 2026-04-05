import DocumentPage from '@/components/DocumentPage';
import { TERMS_OF_SERVICE_MD } from '@/data/terms-of-service';

function TermsOfServicePage() {
    return <DocumentPage title="Terms of Service" content={TERMS_OF_SERVICE_MD} />;
}
export default TermsOfServicePage
