import { useContext, } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Pane, Avatar, Menu, Popover, } from 'evergreen-ui';
import { useRouter, } from 'next/router';
import Icon from './Icon';
import { Context, } from '../utils/store';

export default function Navigation() {
  const router = useRouter();
  const { user, authenticated, logout } = useContext(Context);

  return (
    <Pane
      height={50}
      width='100%'
      display='flex'
      background='#fff'
      justifyContent='space-between'
    >
      <Pane
        width={70}
        display='flex'
        marginLeft={10}
        alignItems='center'
        justifyContent='flex-start' 
      >
        <Link href='/'>
          <a>
            <Image
              alt='logo'
              width={40}
              height={40}
              src='/logo.png'
            />
          </a>
        </Link>
      </Pane>
      <Pane
        width={70}
        display='flex'
        marginRight={10}
        alignItems='center'
        justifyContent='flex-end' 
      >
        {authenticated ? (
          <>
            <Pane marginRight={10}>
              <Link href='/upload' passHref>
                <a>
                  <Icon
                    width='24'
                    height='24'
                    fill='none'
                    strokeWidth='2'
                    name='upload-cloud'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </a>
              </Link>
            </Pane>
      
            <Link href='/account' passHref>
              <Popover
                content={(
                  <Menu>
                    <Menu.Group>
                      <Menu.Item disabled> Profile (coming soon) </Menu.Item>
                      <Link href='/studio'>
                        <Menu.Item>                 
                          Studio
                        </Menu.Item>
                      </Link>
                      <Link href='/account'>
                        <Menu.Item> 
                          Account
                        </Menu.Item>
                      </Link>
                    </Menu.Group>
                    <Menu.Divider />
                    <Menu.Group>
                      <Menu.Item onSelect={() => logout()} intent='danger'>
                        Log out
                      </Menu.Item>
                    </Menu.Group>
                  </Menu>
                )}
              >
                <Avatar
                  size={35}
                  cursor='pointer'
                  src={user.avatar}
                  name={user.username}
                />
              </Popover>
            </Link>
          </>
        )
          : (
            <Icon
              width={20}
              height={20}
              name='user'
              style={{ cursor:'pointer' }}
              onClick={() => router.push('/login')}
            />
          )}
      </Pane>
    </Pane>
  );
}