export async function generateStaticParams() {
    return [
      { kindeAuth: 'login' },
      { kindeAuth: 'logout' },
    ];
  }
  
  import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
  
  export const GET = handleAuth();
  